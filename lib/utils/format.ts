// ═════════════════════════════════════════════════════════════════════════════
// Fonctions utilitaires de formatage
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Formate un prix en euros
 * @example formatPrice(25000) → "25 000 €"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("fr-FR")} €`;
}

/**
 * Formate un kilométrage
 * @example formatKilometrage(45000) → "45 000 km"
 */
export function formatKilometrage(km: number): string {
  return `${km.toLocaleString("fr-FR")} km`;
}

/**
 * Formate une date au format français
 * @example formatDate(new Date("2024-01-15")) → "15 janvier 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formate une date au format court
 * @example formatDateShort(new Date("2024-01-15")) → "15/01/2024"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  return d.toLocaleDateString("fr-FR");
}

/**
 * Formate une date relative (il y a X jours)
 * @example formatRelativeDate(new Date("2024-01-15")) → "il y a 3 jours"
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `il y a ${months} mois`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}

/**
 * Génère un slug à partir d'une chaîne
 * @example slugify("BMW Série 3 2022") → "bmw-serie-3-2022"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ""); // Supprime les tirets au début et à la fin
}

/**
 * Tronque un texte avec ellipse
 * @example truncate("Un très long texte...", 20) → "Un très long texte..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Capitalise la première lettre d'une chaîne
 * @example capitalize("bonjour") → "Bonjour"
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formate un numéro de téléphone français
 * @example formatPhone("0612345678") → "06 12 34 56 78"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }
  
  return phone;
}

/**
 * Valide un format de téléphone français
 * @example isValidPhone("0612345678") → true
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^0[1-9]\d{8}$/.test(cleaned);
}

/**
 * Valide un format d'email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Obtient les initiales d'un nom
 * @example getInitials("Jean Dupont") → "JD"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formate un nombre compact
 * @example formatCompact(1500) → "1.5k"
 */
export function formatCompact(num: number): string {
  if (num < 1000) return String(num);
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}M`;
}

/**
 * Génère une couleur aléatoire (pour avatars par exemple)
 */
export function randomColor(): string {
  const colors = [
    "#FF8633", // Orange VLA
    "#3B82F6", // Bleu
    "#10B981", // Vert
    "#F59E0B", // Jaune
    "#EF4444", // Rouge
    "#8B5CF6", // Violet
    "#EC4899", // Rose
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Génère une classe Tailwind pour un badge de statut
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    NEW: "bg-orange-100 text-orange-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    TREATED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-700",
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    SOLD: "bg-red-100 text-red-700",
    RESERVED: "bg-yellow-100 text-yellow-700",
  };
  
  return statusMap[status] || "bg-gray-100 text-gray-700";
}

/**
 * Traduit un statut en français
 */
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    NEW: "Nouveau",
    IN_PROGRESS: "En cours",
    TREATED: "Traité",
    ARCHIVED: "Archivé",
    DRAFT: "Brouillon",
    PUBLISHED: "Publié",
    SOLD: "Vendu",
    RESERVED: "Réservé",
  };
  
  return statusMap[status] || status;
}
