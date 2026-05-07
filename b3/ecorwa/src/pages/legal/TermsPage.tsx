import { LegalShell } from "@/components/legal/LegalShell";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { LEGAL_EFFECTIVE_DATE, legalContactEmail, legalEntityName } from "@/lib/legal-meta";

export default function TermsPage() {
  useDocumentTitle(`Terms of Use — ${legalEntityName()}`);
  const entity = legalEntityName();
  const email = legalContactEmail();

  return (
    <LegalShell title="Terms of Use">
      <p className="lead text-muted-foreground">
        <strong>Effective date:</strong> {LEGAL_EFFECTIVE_DATE}. These Terms govern your use of this website (
        “<strong>Site</strong>”) operated by {entity} (“<strong>we</strong>”, “<strong>us</strong>”). By using the
        Site, you agree to these Terms. If you do not agree, do not use the Site.
      </p>

      <h2>1. Informational nature</h2>
      <p>
        The Site presents storytelling and educational material about community-led place revival and related themes.
        Nothing on the Site is legal, tax, investment, or financial advice. Any references to tokens, marketplaces, or
        on-chain activity describe ecosystem context—not an offer to sell or solicit securities or regulated financial
        instruments.
      </p>

      <h2>2. No offer</h2>
      <p>
        Nothing on the Site constitutes an offer or solicitation in any jurisdiction where such activity would be
        unlawful. Participation in any future programs or offerings may require eligibility checks and separate
        agreements.
      </p>

      <h2>3. Intellectual property</h2>
      <p>
        Text, visuals, logos, and layout are owned by us or our licensors. You may view and share links for personal,
        non-commercial use. You may not scrape, mirror, or exploit the Site commercially without our written consent.
      </p>

      <h2>4. Third-party links</h2>
      <p>
        The Site may link to independent websites (for example social networks or partner apps). We are not responsible
        for their content or privacy practices.
      </p>

      <h2>5. Disclaimer of warranties</h2>
      <p>
        The Site is provided “as is”. To the fullest extent permitted by law, we disclaim warranties of merchantability,
        fitness for a particular purpose, and non-infringement. We do not warrant uninterrupted or error-free
        operation.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by applicable law, we are not liable for indirect, incidental, special,
        consequential, or punitive damages, or loss of profits, data, or goodwill, arising from your use of the Site.
        Our aggregate liability for claims relating to the Site shall not exceed fifty euros (€50) unless mandatory law
        requires otherwise.
      </p>

      <h2>7. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless {entity} and its representatives from claims arising out of your misuse
        of the Site or violation of these Terms, except where prohibited by law.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these Terms by posting a new effective date. Continued use after changes constitutes acceptance of
        the updated Terms.
      </p>

      <h2>9. Governing law & venue</h2>
      <p>
        These Terms are governed by the laws of Austria, excluding conflict-of-law rules. Courts in Vienna, Austria,
        shall have exclusive jurisdiction for disputes arising from these Terms or the Site, where permitted by law.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms: <a href={`mailto:${email}`}>{email}</a>
      </p>
    </LegalShell>
  );
}
