/**
 * B3 admin branding — purple (#8A5CF5) on black, aligned with b3.game marketing UI.
 * @see https://docs.strapi.io/cms/admin-panel-customization/theme-extension
 */

const themeColors = {
  /* Primary ladder built around B3 purple */
  primary100: "#ede9fe",
  primary200: "#ddd6fe",
  primary500: "#a78bfa",
  primary600: "#8A5CF5",
  primary700: "#7c3aed",
};

const darkSurfaces = {
  /* Near-black surfaces; thin borders stay muted */
  neutral0: "#000000",
  neutral100: "#0a0a0b",
  neutral150: "#141416",
  neutral200: "#1c1c1f",
  neutral500: "#71717a",
  neutral600: "#a1a1aa",
  neutral700: "#d4d4d8",
  neutral800: "#fafafa",
};

export default {
  config: {
    theme: {
      light: {
        colors: {
          ...themeColors,
          neutral0: "#ffffff",
          neutral100: "#fafafa",
          neutral150: "#f4f4f5",
        },
      },
      dark: {
        colors: {
          ...themeColors,
          ...darkSurfaces,
        },
      },
    },
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap() {},
};
