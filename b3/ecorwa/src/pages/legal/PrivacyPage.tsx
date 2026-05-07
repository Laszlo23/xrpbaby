import { LegalShell } from "@/components/legal/LegalShell";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { LEGAL_EFFECTIVE_DATE, legalContactEmail, legalEntityName } from "@/lib/legal-meta";

export default function PrivacyPage() {
  useDocumentTitle(`Privacy — ${legalEntityName()}`);
  const entity = legalEntityName();
  const email = legalContactEmail();

  return (
    <LegalShell title="Privacy Notice">
      <p className="lead text-muted-foreground">
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}. This notice describes how {entity} (“
        <strong>we</strong>”) processes personal data when you use this website (the “<strong>Site</strong>”) in line
        with the EU General Data Protection Regulation (“<strong>GDPR</strong>”) where applicable.
      </p>

      <h2>1. Controller</h2>
      <p>
        The controller responsible for processing personal data in connection with the Site is {entity}. Contact:{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>2. Data we process</h2>
      <ul>
        <li>
          <strong>Technical / server logs:</strong> IP address, date and time, browser type, referrer, and similar
          metadata transmitted by your browser when you request pages.
        </li>
        <li>
          <strong>Communications:</strong> If you email us, we process your address and message content to respond.
        </li>
        <li>
          <strong>Optional wallet features:</strong> If you enable Web3-related features (when offered), your public
          wallet address and chain interactions may be processed by infrastructure providers you connect through your
          wallet—subject to their terms.
        </li>
      </ul>

      <h2>3. Purposes & legal bases</h2>
      <ul>
        <li>
          <strong>Providing the Site</strong> (GDPR Art. 6(1)(f) legitimate interests: secure, stable delivery).
        </li>
        <li>
          <strong>Responding to enquiries</strong> (Art. 6(1)(b) pre-contract / Art. 6(1)(f) where applicable).
        </li>
        <li>
          <strong>Compliance & security</strong> (Art. 6(1)(c) legal obligation / Art. 6(1)(f) fraud prevention).
        </li>
      </ul>

      <h2>4. Cookies & storage</h2>
      <p>
        We use only cookies or local storage strictly necessary to operate the Site unless you consent to additional
        cookies (see our Cookie Notice). You can control cookies through your browser settings.
      </p>

      <h2>5. Recipients</h2>
      <p>
        We use hosting and infrastructure providers that process data on our instructions (processors). Where data is
        transferred outside the EEA, we rely on appropriate safeguards such as Standard Contractual Clauses where
        required.
      </p>

      <h2>6. Retention</h2>
      <p>
        Server logs are retained for a limited period for security and troubleshooting. Email correspondence is kept as
        long as needed to handle your request and any follow-up legal retention periods.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Subject to GDPR and local law, you may have rights to access, rectification, erasure, restriction, portability,
        objection, and to lodge a complaint with a supervisory authority (in Austria:{' '}
        <a href="https://www.dsb.gv.at/" target="_blank" rel="noreferrer noopener">
          Österreichische Datenschutzbehörde
        </a>
        ).
      </p>

      <h2>8. Children</h2>
      <p>The Site is not directed at children under 16. We do not knowingly collect their personal data.</p>

      <h2>9. Updates</h2>
      <p>We may update this notice; the effective date at the top will change when we do.</p>

      <h2>10. Contact</h2>
      <p>
        Privacy requests: <a href={`mailto:${email}`}>{email}</a>
      </p>
    </LegalShell>
  );
}
