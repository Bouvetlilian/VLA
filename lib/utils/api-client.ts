// ═════════════════════════════════════════════════════════════════════════════
// Client API réutilisable pour les appels frontend
// ═════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiError = {
  error: string;
  details?: Record<string, string[]>; // Erreurs de validation Zod
};

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  details?: Record<string, string[]>;
};

// ─── Client API générique ─────────────────────────────────────────────────────

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Une erreur est survenue",
        details: data.details,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("API Client Error:", error);
    return {
      success: false,
      error: "Erreur de connexion au serveur",
    };
  }
}

// ─── Méthodes HTTP ────────────────────────────────────────────────────────────

export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean>) => {
    const queryString = params 
      ? `?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        )}`
      : "";
    
    return apiClient<T>(`${endpoint}${queryString}`, {
      method: "GET",
      cache: "no-store", // Toujours récupérer les données fraîches
    });
  },

  /**
   * POST request avec JSON
   */
  post: <T>(endpoint: string, body: unknown) => {
    return apiClient<T>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },

  /**
   * POST request avec FormData (pour upload de fichiers)
   */
  postForm: <T>(endpoint: string, formData: FormData) => {
    return apiClient<T>(endpoint, {
      method: "POST",
      body: formData,
      // Pas de Content-Type, le navigateur le gère automatiquement avec boundary
    });
  },

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body: unknown) => {
    return apiClient<T>(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string) => {
    return apiClient<T>(endpoint, {
      method: "DELETE",
    });
  },
};

// ─── Helpers spécifiques aux véhicules ────────────────────────────────────────

export type VehicleFilters = {
  marque?: string;
  modele?: string;
  annee?: string;
  carburant?: string;
  boite?: string;
  prixMin?: number;
  prixMax?: number;
  kmMax?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
};

export async function fetchVehicles(filters: VehicleFilters = {}) {
  // Nettoyer les filtres (enlever les valeurs "Tous", "Toutes", etc.)
  const cleanFilters: Record<string, string | number | boolean> = {};
  
  if (filters.marque && filters.marque !== "Toutes") {
    cleanFilters.marque = filters.marque;
  }
  if (filters.modele && filters.modele !== "Tous") {
    cleanFilters.modele = filters.modele;
  }
  if (filters.annee && filters.annee !== "Toutes") {
    cleanFilters.annee = filters.annee;
  }
  if (filters.carburant && filters.carburant !== "Tous") {
    cleanFilters.carburant = filters.carburant;
  }
  if (filters.boite && filters.boite !== "Toutes") {
    cleanFilters.boite = filters.boite;
  }
  if (filters.prixMax !== undefined && filters.prixMax !== 50000) {
    cleanFilters.prixMax = filters.prixMax;
  }
  if (filters.kmMax !== undefined && filters.kmMax !== 999999) {
    cleanFilters.kmMax = filters.kmMax;
  }
  if (filters.featured !== undefined) {
    cleanFilters.featured = filters.featured;
  }
  if (filters.page !== undefined) {
    cleanFilters.page = filters.page;
  }
  if (filters.limit !== undefined) {
    cleanFilters.limit = filters.limit;
  }

  return api.get<{
    vehicles: Array<{
      id: number;
      slug: string;
      marque: string;
      modele: string;
      annee: number;
      kilometrage: number;
      prix: number;
      carburant: string;
      boite: string;
      badge: string | null;
      featured: boolean;
      images: Array<{ url: string; alt: string | null }>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>("/api/vehicles", cleanFilters);
}

export async function fetchVehicleBySlug(slug: string) {
  return api.get<{
    vehicle: {
      id: number;
      slug: string;
      marque: string;
      modele: string;
      annee: number;
      version: string | null;
      kilometrage: number;
      prix: number;
      carburant: string;
      boite: string;
      puissance: string;
      couleur: string;
      portes: number;
      places: number;
      description: string;
      options: string[];
      badge: string | null;
      featured: boolean;
      images: Array<{
        url: string;
        alt: string | null;
        position: number;
        isMain: boolean;
      }>;
    };
  }>(`/api/vehicles/${slug}`);
}

// ─── Helpers spécifiques aux leads ────────────────────────────────────────────

export type CreateBuyLeadData = {
  vehicleId: number;
  prenom: string;
  telephone: string;
  message?: string;
};

export async function createBuyLead(data: CreateBuyLeadData) {
  return api.post<{ lead: { id: string } }>("/api/leads/buy", data);
}

export type CreateSellLeadData = {
  // Étape 1 : Infos véhicule
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  carburant: string;
  boite: string;
  
  // Étape 2 : État
  etat: string;
  carnet: string;
  accident: string;
  commentaire?: string;
  
  // Étape 3 : Coordonnées
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
};

export async function createSellLead(data: CreateSellLeadData, photos: File[]) {
  const formData = new FormData();
  
  // Ajouter tous les champs
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  // Ajouter les photos
  photos.forEach((photo) => {
    formData.append("photos", photo);
  });
  
  return api.postForm<{ lead: { id: string } }>("/api/leads/sell", formData);
}
