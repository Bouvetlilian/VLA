/**
 * Configuration et utilitaires pour l'upload d'images sur Cloudinary
 * 
 * Fonctionnalités :
 * - Upload d'images avec transformations automatiques (resize, quality, format WebP)
 * - Suppression d'images
 * - Gestion des dossiers (vehicles, sell-leads)
 */

import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary (utilise les variables d'environnement)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Interface pour le résultat d'upload
 */
export interface UploadResult {
  url: string;      // URL publique de l'image
  publicId: string; // ID Cloudinary pour suppression ultérieure
}

/**
 * Upload une image sur Cloudinary avec transformations automatiques
 * 
 * @param file - Fichier à uploader (File ou Buffer)
 * @param folder - Dossier Cloudinary (ex: "vehicles", "sell-leads")
 * @returns Promise avec URL et publicId
 * 
 * Transformations appliquées :
 * - Resize max 1200x800px (proportions conservées)
 * - Qualité automatique optimisée
 * - Format WebP si supporté par le navigateur
 */
export async function uploadImage(
  file: File | Buffer,
  folder: string
): Promise<UploadResult> {
  try {
    // Convertir File en base64 si nécessaire
    let dataURI: string;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      dataURI = `data:${file.type};base64,${base64}`;
    } else {
      // Si c'est déjà un Buffer
      const base64 = file.toString("base64");
      dataURI = `data:image/jpeg;base64,${base64}`;
    }

    // Upload sur Cloudinary avec transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `vla-automobiles/${folder}`,
      transformation: [
        { width: 1200, height: 800, crop: "limit" }, // Resize sans déformer
        { quality: "auto:good" },                     // Qualité optimisée
        { fetch_format: "auto" },                     // WebP si supporté
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Erreur upload Cloudinary:", error);
    throw new Error("Échec de l'upload de l'image");
  }
}

/**
 * Supprime une image de Cloudinary
 * 
 * @param publicId - Public ID Cloudinary de l'image
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Erreur suppression Cloudinary:", error);
    throw new Error("Échec de la suppression de l'image");
  }
}

/**
 * Supprime plusieurs images en une seule fois
 * 
 * @param publicIds - Array de Public IDs Cloudinary
 */
export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  try {
    await Promise.all(publicIds.map((id) => deleteImage(id)));
  } catch (error) {
    console.error("Erreur suppression multiple Cloudinary:", error);
    throw new Error("Échec de la suppression des images");
  }
}

/**
 * Vérifie que la configuration Cloudinary est complète
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}