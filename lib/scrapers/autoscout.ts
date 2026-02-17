// lib/scrapers/autoscout.ts
// Collecte les annonces AutoScout24 via leur API interne (endpoint utilisé par leur frontend)
// Retourne un tableau d'annonces normalisées, ou un tableau vide en cas d'échec (fallback gracieux)

export interface AnnonceScrappee {
  source: string
  prix: number
  annee: number
  kilometrage: number
  version?: string
  localisation?: string
  typVendeur?: 'particulier' | 'professionnel'
}

interface AutoScoutListing {
  price?: { value?: number }
  firstRegistration?: string
  mileage?: { value?: number }
  title?: string
  location?: { countryCode?: string; zip?: string; city?: string }
  seller?: { type?: string }
}

interface AutoScoutResponse {
  listings?: AutoScoutListing[]
}

/**
 * Construit l'URL de recherche AutoScout24
 * Utilise l'API publique search endpoint (v.3 - stable depuis 2022)
 */
function buildAutoScoutUrl(params: {
  marque: string
  modele: string
  anneeMin: number
  anneeMax: number
  kmMax: number
}): string {
  const base = 'https://www.autoscout24.fr/lst'

  // Normalisation marque/modèle pour l'URL AutoScout
  const makeSlug = params.marque.toLowerCase().replace(/\s+/g, '-')
  const modelSlug = params.modele.toLowerCase().replace(/\s+/g, '-')

  const queryParams = new URLSearchParams({
    fregfrom: String(params.anneeMin),
    fregto: String(params.anneeMax),
    kmto: String(params.kmMax),
    cy: 'F', // France
    atype: 'C', // Voitures
    sort: 'price',
    desc: '0',
    size: '20',
    page: '1',
    // Format JSON demandé via header, pas via param URL
  })

  return `${base}/${makeSlug}/${modelSlug}?${queryParams.toString()}`
}

/**
 * Scrape AutoScout24 via leur API interne JSON
 * AutoScout expose un endpoint /_next/data qui retourne du JSON propre
 */
export async function scrapeAutoScout24(params: {
  marque: string
  modele: string
  annee: number
  kilometrage: number
}): Promise<AnnonceScrappee[]> {
  const { marque, modele, annee, kilometrage } = params

  // Fourchette : ±2 ans autour de l'année du véhicule
  const anneeMin = annee - 2
  const anneeMax = annee + 1

  // Fourchette kilométrage : jusqu'à +40% du km du véhicule pour avoir assez d'annonces
  const kmMax = Math.min(Math.round(kilometrage * 1.4 / 10000) * 10000, 300000)

  const makeSlug = marque.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire accents
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const modelSlug = modele.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // URL API JSON interne AutoScout24
  const searchParams = new URLSearchParams({
    fregfrom: String(anneeMin),
    fregto: String(anneeMax),
    kmto: String(kmMax),
    cy: 'F',
    atype: 'C',
    sort: 'price',
    desc: '0',
    size: '15',
    page: '1',
    format: 'json',
  })

  const url = `https://www.autoscout24.fr/lst/${makeSlug}/${modelSlug}?${searchParams.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Headers mimant un navigateur pour éviter le blocage
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.autoscout24.fr/',
        'Cache-Control': 'no-cache',
      },
      // Timeout 8 secondes pour rester dans les limites Vercel
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.warn(`[AutoScout24] Réponse HTTP ${response.status} — source ignorée`)
      return []
    }

    const contentType = response.headers.get('content-type') || ''

    // Si on reçoit du JSON directement
    if (contentType.includes('application/json')) {
      const data: AutoScoutResponse = await response.json()
      return parseAutoScoutJSON(data)
    }

    // Si on reçoit du HTML, tenter d'extraire le JSON embarqué (__NEXT_DATA__)
    const html = await response.text()
    return parseAutoScoutHTML(html)

  } catch (error) {
    // Timeout, réseau, CORS — on log et on retourne vide (fallback gracieux)
    console.warn('[AutoScout24] Erreur collecte:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Parse la réponse JSON directe d'AutoScout24
 */
function parseAutoScoutJSON(data: AutoScoutResponse): AnnonceScrappee[] {
  const listings = data?.listings || []

  return listings
    .filter((item) => {
      const prix = item?.price?.value
      return prix && prix > 1000 && prix < 150000
    })
    .map((item): AnnonceScrappee => ({
      source: 'AutoScout24',
      prix: item.price?.value || 0,
      annee: item.firstRegistration
        ? parseInt(item.firstRegistration.split('/')[1] || item.firstRegistration)
        : 0,
      kilometrage: item.mileage?.value || 0,
      version: item.title || undefined,
      localisation: item.location?.city || undefined,
      typVendeur: item.seller?.type === 'dealer' ? 'professionnel' : 'particulier',
    }))
    .slice(0, 12) // Max 12 annonces pour limiter les tokens
}

/**
 * Parse le HTML d'AutoScout24 en cherchant le JSON __NEXT_DATA__
 */
function parseAutoScoutHTML(html: string): AnnonceScrappee[] {
  try {
    // AutoScout24 utilise Next.js — les données sont dans <script id="__NEXT_DATA__">
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (!match) {
      console.warn('[AutoScout24] __NEXT_DATA__ non trouvé dans le HTML')
      return []
    }

    const nextData = JSON.parse(match[1])

    // Navigation dans l'arbre Next.js pour trouver les listings
    const listings =
      nextData?.props?.pageProps?.listings ||
      nextData?.props?.pageProps?.initialState?.search?.listings ||
      nextData?.props?.pageProps?.searchResults?.listings ||
      []

    if (!Array.isArray(listings) || listings.length === 0) {
      console.warn('[AutoScout24] Aucune annonce dans __NEXT_DATA__')
      return []
    }

    return parseAutoScoutJSON({ listings })

  } catch (error) {
    console.warn('[AutoScout24] Erreur parsing HTML:', error instanceof Error ? error.message : error)
    return []
  }
}