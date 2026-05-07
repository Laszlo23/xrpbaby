/** ISO date shown on legal documents (update when terms change). */
export const LEGAL_EFFECTIVE_DATE = "2026-05-03";

export function legalEntityName(): string {
  const v = import.meta.env.VITE_LEGAL_ENTITY_NAME as string | undefined;
  return v?.trim() || "Building Culture LLC";
}

/** Multi-line operator address for imprint (use \\n in env or set VITE_LEGAL_ADDRESS_LINES comma-separated). */
export function legalOperatorAddressLines(): string[] {
  const raw = import.meta.env.VITE_LEGAL_ADDRESS as string | undefined;
  if (raw?.trim()) {
    return raw.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  }
  return [
    "131 Continental Drive Suite 305",
    "Newark",
    "New Castle County, Delaware 19713",
    "United States",
  ];
}

export function legalContactEmail(): string {
  const v = import.meta.env.VITE_LEGAL_CONTACT_EMAIL as string | undefined;
  const fromContact = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
  return (v ?? fromContact)?.trim() || "office@buildingculture.capital";
}

export function legalUidVat(): string | undefined {
  const v = import.meta.env.VITE_LEGAL_UID_VAT as string | undefined;
  return v?.trim() || undefined;
}

export function legalRegistryCourt(): string | undefined {
  const v = import.meta.env.VITE_LEGAL_REGISTRY_COURT as string | undefined;
  return v?.trim() || "State of Delaware (Division of Corporations)";
}

export function legalRegistryNumber(): string | undefined {
  const v = import.meta.env.VITE_LEGAL_REGISTRY_NUMBER as string | undefined;
  return v?.trim() || "#525";
}
