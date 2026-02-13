import { z } from "zod";
import { Carburant, Boite, VehicleStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLE VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma pour créer un nouveau véhicule
 */
export const createVehicleSchema = z.object({
  // Identité
  marque: z.string().min(1, "La marque est obligatoire"),
  modele: z.string().min(1, "Le modèle est obligatoire"),
  annee: z
    .number()
    .int()
    .min(2000, "L'année doit être >= 2000")
    .max(new Date().getFullYear() + 1, "L'année est invalide"),
  version: z.string().optional(),

  // Caractéristiques
  kilometrage: z.number().int().min(0, "Le kilométrage doit être >= 0"),
  prix: z.number().int().min(0, "Le prix doit être >= 0"),
  carburant: z.nativeEnum(Carburant, {
    errorMap: () => ({ message: "Type de carburant invalide" }),
  }),
  boite: z.nativeEnum(Boite, {
    errorMap: () => ({ message: "Type de boîte invalide" }),
  }),
  puissance: z.string().min(1, "La puissance est obligatoire"),
  couleur: z.string().min(1, "La couleur est obligatoire"),
  portes: z.number().int().min(2).max(5, "Nombre de portes invalide"),
  places: z.number().int().min(2).max(9, "Nombre de places invalide"),

  // Contenu
  description: z
    .string()
    .min(50, "La description doit faire au moins 50 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères"),
  options: z.array(z.string()).default([]),

  // Statut
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.DRAFT),
  badge: z.string().optional(),
  featured: z.boolean().default(false),
});

/**
 * Schéma pour mettre à jour un véhicule
 * Tous les champs sont optionnels
 */
export const updateVehicleSchema = createVehicleSchema.partial();

/**
 * Schéma pour les query params de filtrage
 */
export const vehicleFiltersSchema = z.object({
  marque: z.string().optional(),
  modele: z.string().optional(),
  annee: z.coerce.number().int().optional(),
  carburant: z.nativeEnum(Carburant).optional(),
  boite: z.nativeEnum(Boite).optional(),
  prixMin: z.coerce.number().int().min(0).optional(),
  prixMax: z.coerce.number().int().min(0).optional(),
  kilometrageMax: z.coerce.number().int().min(0).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Schéma pour uploader une image de véhicule
 */
export const vehicleImageSchema = z.object({
  url: z.string().url("URL invalide"),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  position: z.number().int().min(0).default(0),
  isMain: z.boolean().default(false),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES INFERRED
// ─────────────────────────────────────────────────────────────────────────────

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;
export type VehicleImageInput = z.infer<typeof vehicleImageSchema>;
