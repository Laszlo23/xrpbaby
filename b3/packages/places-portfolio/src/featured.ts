/** Featured portfolio property IDs — keep in sync across app surfaces. */
export const FEATURED_PROPERTY_IDS = [1, 2, 4, 5] as const;

export type FeaturedPropertyId = (typeof FEATURED_PROPERTY_IDS)[number];
