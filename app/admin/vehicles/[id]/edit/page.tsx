// app/admin/vehicles/[id]/edit/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modification d'un véhicule existant - Back office admin
// Formulaire pré-rempli avec gestion complète des images
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, FormEvent, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type FormData = {
  marque: string;
  modele: string;
  annee: string;
  version: string;
  kilometrage: string;
  prix: string;
  carburant: string;
  boite: string;
  puissance: string;
  couleur: string;
  portes: string;
  places: string;
  description: string;
  options: string;
  status: string;
  badge: string;
  featured: boolean;
};

type ExistingImage = {
  id: string;
  url: string;
  publicId: string | null;
  position: number;
  isMain: boolean;
};

type NewImagePreview = {
  file: File;
  preview: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditVehiclePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Images existantes
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // Nouvelles images à uploader
  const [newImages, setNewImages] = useState<NewImagePreview[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    marque: "",
    modele: "",
    annee: "",
    version: "",
    kilometrage: "",
    prix: "",
    carburant: "ESSENCE",
    boite: "MANUELLE",
    puissance: "",
    couleur: "",
    portes: "5",
    places: "5",
    description: "",
    options: "",
    status: "DRAFT",
    badge: "",
    featured: false,
  });

  // Charger les données du véhicule
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/admin/vehicles/${vehicleId}`);
        const data = await response.json();

        if (response.ok) {
          const vehicle = data.vehicle;
          
          // Remplir le formulaire
          setFormData({
            marque: vehicle.marque,
            modele: vehicle.modele,
            annee: vehicle.annee.toString(),
            version: vehicle.version || "",
            kilometrage: vehicle.kilometrage.toString(),
            prix: vehicle.prix.toString(),
            carburant: vehicle.carburant,
            boite: vehicle.boite,
            puissance: vehicle.puissance,
            couleur: vehicle.couleur,
            portes: vehicle.portes.toString(),
            places: vehicle.places.toString(),
            description: vehicle.description,
            options: vehicle.options.join(", "),
            status: vehicle.status,
            badge: vehicle.badge || "",
            featured: vehicle.featured,
          });

          // Charger les images existantes
          if (vehicle.images && vehicle.images.length > 0) {
            setExistingImages(vehicle.images);
          }
        } else {
          setError("Véhicule introuvable");
        }
      } catch (err) {
        setError("Erreur lors du chargement");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  // ─────────────────────────────────────────────────────────────────────────
  // GESTION DES IMAGES EXISTANTES
  // ─────────────────────────────────────────────────────────────────────────

  // Marquer une image existante pour suppression
  const handleDeleteExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  // Annuler la suppression d'une image
  const handleUndoDeleteExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  // Définir une image existante comme principale
  const handleSetExistingImageAsMain = async (imageId: string) => {
    // Mettre à jour localement
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }))
    );

    // Réorganiser les positions (image principale = position 0)
    const imageToMove = existingImages.find((img) => img.id === imageId);
    if (!imageToMove) return;

    const otherImages = existingImages.filter((img) => img.id !== imageId);
    const reorderedImages = [
      { ...imageToMove, isMain: true, position: 0 },
      ...otherImages.map((img, index) => ({
        ...img,
        isMain: false,
        position: index + 1,
      })),
    ];

    setExistingImages(reorderedImages);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GESTION DES NOUVELLES IMAGES
  // ─────────────────────────────────────────────────────────────────────────

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImagePreviews: NewImagePreview[] = [];

    Array.from(files).forEach((file) => {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} n'est pas une image`);
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} est trop volumineux (max 5MB)`);
        return;
      }

      // Créer un preview
      const preview = URL.createObjectURL(file);
      newImagePreviews.push({ file, preview });
    });

    setNewImages((prev) => [...prev, ...newImagePreviews]);

    // Reset l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => {
      const updated = [...prev];
      // Libérer la mémoire du preview
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SOUMISSION DU FORMULAIRE
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Créer un FormData
      const payload = new FormData();

      // Ajouter les champs du véhicule
      payload.append("marque", formData.marque);
      payload.append("modele", formData.modele);
      payload.append("annee", formData.annee);
      payload.append("version", formData.version);
      payload.append("kilometrage", formData.kilometrage);
      payload.append("prix", formData.prix);
      payload.append("carburant", formData.carburant);
      payload.append("boite", formData.boite);
      payload.append("puissance", formData.puissance);
      payload.append("couleur", formData.couleur);
      payload.append("portes", formData.portes);
      payload.append("places", formData.places);
      payload.append("description", formData.description);
      payload.append("status", formData.status);
      payload.append("badge", formData.badge);
      payload.append("featured", formData.featured.toString());

      // Transformer les options en JSON
      const optionsArray = formData.options
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);
      payload.append("options", JSON.stringify(optionsArray));

      // Ajouter les IDs d'images à supprimer
      if (imagesToDelete.length > 0) {
        payload.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      // Ajouter les nouvelles images
      newImages.forEach((img) => {
        payload.append("newImages", img.file);
      });

      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "PUT",
        body: payload,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Véhicule modifié avec succès !");
        
        // Nettoyer les previews
        newImages.forEach((img) => URL.revokeObjectURL(img.preview));
        
        router.push("/admin/vehicles");
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Chargement du véhicule...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.marque) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Link
            href="/admin/vehicles"
            className="text-sm font-bold text-vla-orange hover:underline"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  // Calculer les images visibles (existantes non supprimées)
  const visibleExistingImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img.id)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-vla-orange mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la liste
        </Link>

        <h1 className="font-black text-3xl text-vla-black mb-2">
          Modifier le véhicule
        </h1>
        <p className="text-gray-500 font-semibold">
          {formData.marque} {formData.modele} - {formData.annee}
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* Section 1 : Informations générales */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Marque *
              </label>
              <input
                type="text"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Modèle *
              </label>
              <input
                type="text"
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Année *
              </label>
              <input
                type="number"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kilométrage *
              </label>
              <input
                type="number"
                name="kilometrage"
                value={formData.kilometrage}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Caractéristiques techniques */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Caractéristiques techniques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Carburant *
              </label>
              <select
                name="carburant"
                value={formData.carburant}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRIDE">Hybride</option>
                <option value="HYBRIDE_RECHARGEABLE">Hybride rechargeable</option>
                <option value="ELECTRIQUE">Électrique</option>
                <option value="GPL">GPL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Boîte de vitesses *
              </label>
              <select
                name="boite"
                value={formData.boite}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="MANUELLE">Manuelle</option>
                <option value="AUTOMATIQUE">Automatique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Puissance *
              </label>
              <input
                type="text"
                name="puissance"
                value={formData.puissance}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Couleur *
              </label>
              <input
                type="text"
                name="couleur"
                value={formData.couleur}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de portes *
              </label>
              <select
                name="portes"
                value={formData.portes}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="3">3 portes</option>
                <option value="5">5 portes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de places *
              </label>
              <select
                name="places"
                value={formData.places}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="2">2 places</option>
                <option value="4">4 places</option>
                <option value="5">5 places</option>
                <option value="7">7 places</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3 : Description et options */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Description et équipements
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description complète *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Options (séparées par des virgules)
              </label>
              <textarea
                name="options"
                value={formData.options}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4 : Gestion des images */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Photos du véhicule
          </h2>

          {/* Images existantes */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Images actuelles ({visibleExistingImages.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((img) => {
                  const isMarkedForDeletion = imagesToDelete.includes(img.id);
                  
                  return (
                    <div key={img.id} className="relative group">
                      {/* Image */}
                      <div
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 ${
                          isMarkedForDeletion ? "opacity-40" : ""
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={`Photo ${img.position + 1}`}
                          fill
                          className="object-cover"
                        />
                        
                        {/* Badge "Principale" */}
                        {img.isMain && !isMarkedForDeletion && (
                          <div className="absolute top-2 left-2 bg-vla-orange text-white text-xs font-bold px-2 py-1 rounded">
                            Principale
                          </div>
                        )}

                        {/* Badge "À supprimer" */}
                        {isMarkedForDeletion && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            À supprimer
                          </div>
                        )}

                        {/* Overlay au hover */}
                        {!isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {/* Bouton "Définir comme principale" */}
                            {!img.isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetExistingImageAsMain(img.id)}
                                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                                title="Définir comme image principale"
                              >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </button>
                            )}

                            {/* Bouton supprimer */}
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingImage(img.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Bouton annuler suppression */}
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleUndoDeleteExistingImage(img.id)}
                              className="px-3 py-2 bg-white text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {imagesToDelete.length > 0 && (
                <p className="text-xs text-red-600 mt-3 font-semibold">
                  ⚠️ {imagesToDelete.length} image{imagesToDelete.length > 1 ? "s" : ""} sera{imagesToDelete.length > 1 ? "ont" : ""} supprimée{imagesToDelete.length > 1 ? "s" : ""} définitivement
                </p>
              )}
            </div>
          )}

          {/* Zone d'upload pour nouvelles images */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Ajouter de nouvelles images
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageSelect}
              className="hidden"
              id="new-image-upload"
            />
            
            <label
              htmlFor="new-image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-vla-orange hover:bg-orange-50 transition-all"
            >
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-semibold text-gray-600">
                Cliquez pour ajouter des images
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP (max 5MB par image)
              </span>
            </label>
          </div>

          {/* Preview des nouvelles images */}
          {newImages.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Nouvelles images à ajouter ({newImages.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newImages.map((img, index) => (
                  <div key={index} className="relative group">
                    {/* Image */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={img.preview}
                        alt={`Nouvelle image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      
                      {/* Badge "Nouveau" */}
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Nouveau
                      </div>

                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        {/* Bouton supprimer */}
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Nom du fichier */}
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {img.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message info */}
          {visibleExistingImages.length > 0 && (
            <p className="text-xs text-gray-500 mt-4">
              💡 Cliquez sur l'étoile pour définir une nouvelle image principale
            </p>
          )}
        </div>

        {/* Section 5 : Publication */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Publication
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="RESERVED">Réservé</option>
                <option value="SOLD">Vendu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Badge (optionnel)
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-vla-orange focus:ring-vla-orange"
                />
                <span className="text-sm font-bold text-gray-700">
                  Mettre en avant sur la page d'accueil
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/vehicles"
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}