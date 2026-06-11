export const locales = ["de", "en", "ar", "tr", "uk", "ru", "fa", "ro", "sr", "hr", "bs", "pl", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  ar: "العربية",
  tr: "Türkçe",
  uk: "Українська",
  ru: "Русский",
  fa: "فارسی",
  ro: "Română",
  sr: "Српски",
  hr: "Hrvatski",
  bs: "Bosanski",
  pl: "Polski",
  es: "Español",
  fr: "Français",
};
