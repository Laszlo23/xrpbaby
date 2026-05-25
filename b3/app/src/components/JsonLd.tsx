type JsonLdProps = {
  id: string;
  data: Record<string, unknown>;
};

/** Structured data for crawlers (safe JSON-LD in document body). */
export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
