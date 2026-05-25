import { LegalShell } from "@/components/legal/LegalShell";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { LEGAL_EFFECTIVE_DATE, legalContactEmail, legalEntityName } from "@/lib/legal-meta";

export default function DisclaimerPage() {
  useDocumentTitle(`Risk & information disclaimer — ${legalEntityName()}`);
  const entity = legalEntityName();
  const email = legalContactEmail();

  return (
    <LegalShell title="Risk & information disclaimer">
      <p className="lead text-muted-foreground">
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}. This disclaimer supplements our Terms of Use and
        applies to informational content about property-led revival and related concepts described on this Site.
      </p>

      <h2>1. Not investment, legal, or tax advice</h2>
      <p>
        All materials on this Site are for general information and storytelling only. They do not constitute investment
        advice, an offer to buy or sell securities or financial instruments, legal advice, or tax advice. You should
        consult qualified professionals before making financial or legal decisions.
      </p>

      <h2>2. Forward-looking statements</h2>
      <p>
        Narratives about future use of buildings, communities, or technologies may include forward-looking statements.
        Actual outcomes may differ materially. {entity} undertakes no obligation to update such statements.
      </p>

      <h2>3. Regulatory status</h2>
      <p>
        References to tokens, digital assets, or marketplaces describe ecosystem context and possible future mechanics.
        Regulatory treatment depends on jurisdiction and facts; nothing here confirms legality or licensing status of
        any product.
      </p>

      <h2>4. Property & sponsor risk</h2>
      <p>
        Real-property and community projects involve execution, liquidity, regulatory, environmental, and sponsor risks.
        Past or illustrated scenarios are not reliable indicators of future results.
      </p>

      <h2>5. Third-party actions</h2>
      <p>
        When you follow links or connect third-party wallets or apps, you interact under those providers’ terms. We are
        not responsible for their conduct or losses arising from their services.
      </p>

      <h2>6. Contact</h2>
      <p>
        <a href={`mailto:${email}`}>{email}</a>
      </p>
    </LegalShell>
  );
}
