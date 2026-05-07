import { LegalShell } from "@/components/legal/LegalShell";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { LEGAL_EFFECTIVE_DATE, legalContactEmail, legalEntityName } from "@/lib/legal-meta";

export default function CookiesPage() {
  useDocumentTitle(`Cookies — ${legalEntityName()}`);
  const entity = legalEntityName();
  const email = legalContactEmail();

  return (
    <LegalShell title="Cookie Notice">
      <p className="lead text-muted-foreground">
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}. This notice explains how {entity} uses cookies and
        similar technologies on this Site.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. Local storage works similarly. They help the Site remember
        preferences and function correctly.
      </p>

      <h2>2. Cookies we use</h2>
      <ul>
        <li>
          <strong>Strictly necessary:</strong> Required for core functionality (for example routing in a single-page
          app, security-related tokens where applicable). These do not require consent under EU ePrivacy guidance where
          they are strictly necessary to provide a service you requested.
        </li>
        <li>
          <strong>Optional analytics / marketing:</strong> We do not enable third-party advertising cookies by default on
          this Site. If we add optional analytics in the future, we will ask for your consent where required before
          storing non-essential cookies.
        </li>
      </ul>

      <h2>3. Managing preferences</h2>
      <p>
        You can delete or block cookies through your browser settings. Blocking strictly necessary cookies may impair the
        Site.
      </p>

      <h2>4. Contact</h2>
      <p>
        Questions: <a href={`mailto:${email}`}>{email}</a>
      </p>
    </LegalShell>
  );
}
