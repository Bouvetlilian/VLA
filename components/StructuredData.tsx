/**
 * Structured Data Component
 * 
 * Composant React pour injecter des données structurées JSON-LD
 * dans le <head> des pages.
 * 
 * Usage :
 * <StructuredData data={generateLocalBusinessLD()} />
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Composant StructuredData
 * 
 * Injecte un script JSON-LD dans le document
 * pour améliorer le SEO avec Schema.org
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}