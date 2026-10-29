import { Breadcrumbs, Container, createTheme } from "@mantine/core";

const gutter = { base: 20, sm: 32, lg: 48 };
const contentWidth = 1320;

export const theme = createTheme({
  fontFamily: "Inter, sans-serif",
  other: { gutter, contentWidth },
  components: {
    Container: Container.extend({
      defaultProps: { size: contentWidth, px: gutter },
    }),
    Breadcrumbs: Breadcrumbs.extend({
      defaultProps: { mb: 32 },
      styles: {
        root: { flexWrap: "wrap", rowGap: 8 },
        breadcrumb: { whiteSpace: "normal", minWidth: 0 },
      },
    }),
  },
  headings: {
    fontFamily: "Poppins, sans-serif",
    sizes: {
      h1: { fontSize: "40px", fontWeight: "700" },
      h2: { fontSize: "32px", fontWeight: "600" },
      h3: { fontSize: "24px", fontWeight: "600" },
      h4: { fontSize: "20px", fontWeight: "500" },
    },
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
  },
  lineHeights: {
    xs: "1.4",
    sm: "1.5",
    md: "1.5",
    lg: "1.6",
  },
});
