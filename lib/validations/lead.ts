import { z } from "zod";
import { LeadStatus } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// BUY LEAD VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma pour créer une demande d'achat (formulaire public)
 */
export const createBuyLeadSchema = z.object({
  vehicleId: z.number().int().positive("ID véhicule invalide"),
  prenom: z
    .string()
    .min(2, "Le prénom doit faire au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom contient des caractères invalides"),
  telephone: z
    .string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Numéro de téléphone invalide (format français attendu)"
    ),
  message: z.string().max(1000, "Le message ne peut pas dépasser 1000 caractères").optional(),
});

/**
 * Schéma pour mettre à jour un lead achat (admin)
 */
export const updateBuyLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().max(5000, "Les notes ne peuvent pas dépasser 5000 caractères").optional(),
  assignedTo: z.string().optional(),
});

/**
 * Schéma pour filtrer les leads achat
 */
export const buyLeadFiltersSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  vehicleId: z.coerce.number().int().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// SELL LEAD VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma pour créer une demande de vente (formulaire public 3 étapes)
 */
export const createSellLeadSchema = z.object({
  // ── Étape 1 : Infos véhicule ──
  marque: z.string().min(1, "La marque est obligatoire"),
  modele: z.string().min(1, "Le modèle est obligatoire"),
  annee: z
    .number()
    .int()
    .min(1990, "L'année doit être >= 1990")
    .max(new Date().getFullYear(), "L'année est invalide"),
  kilometrage: z.number().int().min(0, "Le kilométrage doit être >= 0"),
  carburant: z.string().min(1, "Le carburant est obligatoire"),
  boite: z.string().min(1, "Le type de boîte est obligatoire"),

  // ── Étape 2 : État du véhicule ──
  etat: z.enum(["Excellent", "Bon", "Correct", "À rénover"], {
    errorMap: () => ({ message: "État invalide" }),
  }),
  carnet: z.enum(["Complet", "Incomplet", "Absent", "Non applicable"], {
    errorMap: () => ({ message: "Option carnet invalide" }),
  }),
  accident: z.enum(["Aucun accident", "Accident(s) réparé(s)", "Je ne sais pas"], {
    errorMap: () => ({ message: "Option accident invalide" }),
  }),
  commentaire: z
    .string()
    .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères")
    .optional(),

  // ── Étape 3 : Coordonnées ──
  prenom: z
    .string()
    .min(2, "Le prénom doit faire au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom contient des caractères invalides"),
  nom: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),
  email: z.string().email("Email invalide"),
  telephone: z
    .string()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Numéro de téléphone invalide (format français attendu)"
    ),
});

/**
 * Schéma pour mettre à jour un lead vente (admin)
 */
export const updateSellLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  notes: z.string().max(5000, "Les notes ne peuvent pas dépasser 5000 caractères").optional(),
  assignedTo: z.string().optional(),
  estimation: z.string().max(100, "L'estimation ne peut pas dépasser 100 caractères").optional(),
});

/**
 * Schéma pour filtrer les leads vente
 */
export const sellLeadFiltersSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  marque: z.string().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES INFERRED
// ─────────────────────────────────────────────────────────────────────────────

export type CreateBuyLeadInput = z.infer<typeof createBuyLeadSchema>;
export type UpdateBuyLeadInput = z.infer<typeof updateBuyLeadSchema>;
export type BuyLeadFilters = z.infer<typeof buyLeadFiltersSchema>;

export type CreateSellLeadInput = z.infer<typeof createSellLeadSchema>;
export type UpdateSellLeadInput = z.infer<typeof updateSellLeadSchema>;
export type SellLeadFilters = z.infer<typeof sellLeadFiltersSchema>;
