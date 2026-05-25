import { LegalShell } from "@/components/legal/LegalShell";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  LEGAL_EFFECTIVE_DATE,
  legalContactEmail,
  legalEntityName,
  legalOperatorAddressLines,
  legalRegistryCourt,
  legalRegistryNumber,
  legalUidVat,
} from "@/lib/legal-meta";

export default function ImprintPage() {
  useDocumentTitle(`Imprint — ${legalEntityName()}`);
  const entity = legalEntityName();
  const lines = legalOperatorAddressLines();
  const email = legalContactEmail();
  const uid = legalUidVat();
  const court = legalRegistryCourt();
  const regNo = legalRegistryNumber();

  return (
    <LegalShell title="Imprint">
      <p className="lead text-muted-foreground">
        <strong>Information pursuant to § 5 E-Commerce Act (ECG), § 25 Media Act (MedienG)</strong> — Austria.{' '}
        <strong>Last updated:</strong> {LEGAL_EFFECTIVE_DATE}.
      </p>

      <h2>Operator / media owner</h2>
      <p>
        <strong>{entity}</strong>
        <br />
        {lines.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </p>

      <h2>Contact</h2>
      <p>
        E-mail: <a href={`mailto:${email}`}>{email}</a>
      </p>

      {(uid || (court && regNo)) && (
        <>
          <h2>Commercial register / VAT</h2>
          <ul className="list-none pl-0 space-y-1">
            {uid ? (
              <li>
                <strong>UID / VAT:</strong> {uid}
              </li>
            ) : null}
            {court && regNo ? (
              <li>
                <strong>Register court / number:</strong> {court}, {regNo}
              </li>
            ) : null}
          </ul>
        </>
      )}

      <h2>Applicable law</h2>
      <p>
        For disputes with consumers within the EU, online dispute resolution (ODR):{' '}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer noopener">
          https://ec.europa.eu/consumers/odr/
        </a>
        . We are not obliged or willing to participate in consumer arbitration before a dispute-resolution body, unless
        required by law.
      </p>

      <h2>Liability for content</h2>
      <p>
        We prepare the content of this Site with care but cannot guarantee completeness or accuracy. Obligations to
        remove or block unlawful content under general law remain unaffected.
      </p>

      <h2>Liability for links</h2>
      <p>
        The Site may contain links to external websites. We have no influence over their content; respective operators
        are responsible. Unlawful links will be removed upon becoming aware.
      </p>

      <h2>Copyright</h2>
      <p>
        Content published by {entity} on this Site is subject to Austrian copyright law. Reproduction outside limits of
        copyright requires prior written consent.
      </p>
    </LegalShell>
  );
}
