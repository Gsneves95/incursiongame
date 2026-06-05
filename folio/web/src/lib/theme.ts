// Applies theme (light/dark) and palette to the <html> element via the
// data-attributes the design tokens key off of. Persisted to localStorage so
// the choice survives reloads even before the user is loaded.

type Appearance = { theme?: "light" | "dark"; palette?: "violet" | "cobalt" | "emerald" | "coral"; locale?: string };

const THEME_KEY = "folio_theme";
const PALETTE_KEY = "folio_palette";

export function applyAppearance({ theme, palette }: Appearance) {
  const root = document.documentElement;
  if (theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  if (palette) {
    // "violet" is the default (no attribute needed).
    if (palette === "violet") root.removeAttribute("data-palette");
    else root.setAttribute("data-palette", palette);
    localStorage.setItem(PALETTE_KEY, palette);
  }
}

export function bootstrapAppearance() {
  applyAppearance({
    theme: (localStorage.getItem(THEME_KEY) as "light" | "dark") ?? "light",
    palette: (localStorage.getItem(PALETTE_KEY) as Appearance["palette"]) ?? "violet",
  });
}
