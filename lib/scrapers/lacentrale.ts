// lib/scrapers/lacentrale.ts
// Collecte les annonces La Centrale via leur API interne
// La Centrale est la référence pro en France — priorité haute pour la précision
// Retourne un tableau d'annonces normalisées, ou tableau vide en cas d'échec

import type { AnnonceScrappee } from './autoscout'

interface LaCentraleListing {
  price?: number
  mileage?: number
  year?: number
  version?: string
  city?: string
  sellerType?: string
  // Format alternatif selon la version de l'API
  Prix?: number
  Kilometrage?: number
  Annee?: number
  Version?: string
  Ville?: string
  TypeVendeur?: string
}

interface LaCentraleResponse {
  ads?: LaCentraleListing[]
  data?: { ads?: LaCentraleListing[] }
  vehicles?: LaCentraleListing[]
  results?: LaCentraleListing[]
}

/**
 * Mappe les marques vers les slugs La Centrale
 * La Centrale utilise ses propres identifiants internes
 */
const MARQUE_SLUGS: Record<string, string> = {
  'peugeot': 'peugeot',
  'renault': 'renault',
  'citroen': 'citroen',
  'citroën': 'citroen',
  'volkswagen': 'volkswagen',
  'vw': 'volkswagen',
  'bmw': 'bmw',
  'mercedes': 'mercedes-benz',
  'mercedes-benz': 'mercedes-benz',
  'audi': 'audi',
  'toyota': 'toyota',
  'ford': 'ford',
  'opel': 'opel',
  'nissan': 'nissan',
  'hyundai': 'hyundai',
  'kia': 'kia',
  'seat': 'seat',
  'skoda': 'skoda',
  'fiat': 'fiat',
  'dacia': 'dacia',
  'volvo': 'volvo',
  'honda': 'honda',
  'mazda': 'mazda',
  'mini': 'mini',
  'jeep': 'jeep',
  'land rover': 'land-rover',
  'landrover': 'land-rover',
  'tesla': 'tesla',
  'ds': 'ds',
  'alfa romeo': 'alfa-romeo',
  'porsche': 'porsche',
  'lexus': 'lexus',
  'suzuki': 'suzuki',
  'mitsubishi': 'mitsubishi',
}

function normalizeMarque(marque: string): string {
  const key = marque.toLowerCase().trim()
  return MARQUE_SLUGS[key] || key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function normalizeModele(modele: string): string {
  return modele.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Scrape La Centrale via leur API de recherche interne
 * Utilise l'endpoint de recherche JSON exposé par leur API mobile/frontend
 */
export async function scrapeLaCentrale(params: {
  marque: string
  modele: string
  annee: number
  kilometrage: number
}): Promise<AnnonceScrappee[]> {
  const { marque, modele, annee, kilometrage } = params

  const marqueSlug = normalizeMarque(marque)
  const modeleSlug = normalizeModele(modele)

  const anneeMin = annee - 2
  const anneeMax = annee + 1
  const kmMax = Math.min(Math.round(kilometrage * 1.4 / 10000) * 10000, 300000)

  // Tentative 1 : API JSON interne La Centrale (endpoint v2)
  const apiUrl = `https://www.lacentrale.fr/api/search/vehicles?` + new URLSearchParams({
    makesModelsCommercialNames: `${marqueSlug}:${modeleSlug}`,
    yearMin: String(anneeMin),
    yearMax: String(anneeMax),
    mileageMax: String(kmMax),
    sortBy: 'PRICE_ASC',
    size: '15',
    from: '0',
  }).toString()

  // Tentative 2 : URL de recherche classique (fallback HTML)
  const htmlUrl = `https://www.lacentrale.fr/listing?` + new URLSearchParams({
    makesModelsCommercialNames: `${marqueSlug}:${modeleSlug}`,
    yearMin: String(anneeMin),
    yearMax: String(anneeMax),
    mileageMax: String(kmMax),
    sortBy: 'PRICE_ASC',
  }).toString()

  const headers = {
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'fr-FR,fr;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.lacentrale.fr/',
    'Cache-Control': 'no-cache',
  }

  // Essai 1 : API JSON directe
  try {
    const response = await fetch(apiUrl, {
      headers: { ...headers, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })

    if (response.ok) {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data: LaCentraleResponse = await response.json()
        const annonces = parseLaCentraleJSON(data)
        if (annonces.length > 0) {
          console.log(`[LaCentrale] ${annonces.length} annonces via API JSON`)
          return annonces
        }
      }
    }
  } catch (err) {
    console.warn('[LaCentrale] API JSON échouée:', err instanceof Error ? err.message : err)
  }

  // Essai 2 : Page HTML avec __NEXT_DATA__
  try {
    const response = await fetch(htmlUrl, {
      headers,
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.warn(`[LaCentrale] HTTP ${response.status} — source ignorée`)
      return []
    }

    const html = await response.text()
    const annonces = parseLaCentraleHTML(html)
    console.log(`[LaCentrale] ${annonces.length} annonces via HTML`)
    return annonces

  } catch (error) {
    console.warn('[LaCentrale] Erreur collecte HTML:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Parse la réponse JSON de l'API La Centrale
 * Gère plusieurs structures possibles selon la version d'API
 */
function parseLaCentraleJSON(data: LaCentraleResponse): AnnonceScrappee[] {
  // La Centrale peut retourner les données sous différentes clés
  const listings: LaCentraleListing[] =
    data?.ads ||
    data?.data?.ads ||
    data?.vehicles ||
    data?.results ||
    []

  return listings
    .filter((item) => {
      const prix = item.price || item.Prix
      return prix && prix > 1000 && prix < 150000
    })
    .map((item): AnnonceScrappee => ({
      source: 'La Centrale',
      prix: item.price || item.Prix || 0,
      annee: item.year || item.Annee || 0,
      kilometrage: item.mileage || item.Kilometrage || 0,
      version: item.version || item.Version || undefined,
      localisation: item.city || item.Ville || undefined,
      typVendeur: (item.sellerType || item.TypeVendeur) === 'PRO'
        ? 'professionnel'
        : 'particulier',
    }))
    .slice(0, 12)
}

/**
 * Parse le HTML La Centrale en cherchant le JSON embarqué
 * La Centrale utilise aussi Next.js / données JSON dans le HTML
 */
function parseLaCentraleHTML(html: string): AnnonceScrappee[] {
  // Tentative 1 : __NEXT_DATA__ (si site Next.js)
  const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextMatch) {
    try {
      const nextData = JSON.parse(nextMatch[1])
      const listings =
        nextData?.props?.pageProps?.vehicles ||
        nextData?.props?.pageProps?.ads ||
        nextData?.props?.pageProps?.searchResults?.vehicles ||
        nextData?.props?.pageProps?.initialState?.vehicles ||
        []

      if (Array.isArray(listings) && listings.length > 0) {
        return parseLaCentraleJSON({ ads: listings })
      }
    } catch {
      // Continue vers tentative 2
    }
  }

  // Tentative 2 : JSON embarqué dans window.__PRELOADED_STATE__ ou similaire
  const stateMatch = html.match(/window\.__(?:PRELOADED_STATE|INITIAL_STATE|APP_STATE)__\s*=\s*({[\s\S]*?});/)
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1])
      const listings =
        state?.search?.vehicles ||
        state?.vehicles?.list ||
        state?.ads ||
        []

      if (Array.isArray(listings) && listings.length > 0) {
        return parseLaCentraleJSON({ ads: listings })
      }
    } catch {
      // Continue
    }
  }

  // Tentative 3 : Extraction regex brute des prix depuis le HTML
  // Dernier recours — moins fiable mais donne au moins les prix
  return extractPrixFromHTML(html)
}

/**
 * Extraction brute des prix depuis le HTML en dernier recours
 * Cherche les patterns de prix typiques (ex: "12 500 €", "12500€")
 */
function extractPrixFromHTML(html: string): AnnonceScrappee[] {
  const annonces: AnnonceScrappee[] = []

  // Pattern prix : nombre entre 2000 et 100000 suivi de € ou EUR
  const prixPattern = /(\d{1,3}(?:\s?\d{3})*)\s*€/g
  const kmPattern = /(\d{1,3}(?:\s?\d{3})*)\s*km/gi

  const prix: number[] = []
  const kms: number[] = []

  let match
  while ((match = prixPattern.exec(html)) !== null) {
    const p = parseInt(match[1].replace(/\s/g, ''))
    if (p >= 2000 && p <= 100000) prix.push(p)
  }

  while ((match = kmPattern.exec(html)) !== null) {
    const k = parseInt(match[1].replace(/\s/g, ''))
    if (k >= 1000 && k <= 400000) kms.push(k)
  }

  // Associer prix et km dans l'ordre trouvé (approximatif)
  const count = Math.min(prix.length, Math.max(kms.length, 1), 10)
  for (let i = 0; i < count; i++) {
    if (prix[i]) {
      annonces.push({
        source: 'La Centrale',
        prix: prix[i],
        annee: 0, // Non extrait en mode fallback brut
        kilometrage: kms[i] || 0,
      })
    }
  }

  if (annonces.length > 0) {
    console.warn(`[LaCentrale] Mode extraction brute — ${annonces.length} prix extraits (précision réduite)`)
  }

  return annonces.slice(0, 10)
}