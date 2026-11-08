type Scale<K extends number> = Record<K, string>;

export type Palette = {
  id: string;
  name: string;
  /** Brand colour; 600 is used on light surfaces, 400 on dark ones. */
  primary: Scale<50 | 100 | 200 | 400 | 500 | 600 | 700>;
  /** Dark-mode surfaces, tinted toward the brand colour. */
  ink: Scale<700 | 800 | 900 | 950>;
  /** Light-mode page background. */
  canvas: string;
  /** Light-mode hairlines and dividers. */
  border: string;
};

export const palettes: Palette[] = [
  {
    id: "violet",
    name: "Violet",
    primary: {
      50: "#f1edff",
      100: "#e4dcff",
      200: "#cbbcff",
      400: "#9a7fff",
      500: "#7c5cff",
      600: "#6a45f5",
      700: "#5632d6",
    },
    ink: { 700: "#2c2848", 800: "#1b1830", 900: "#100e1d", 950: "#0b0914" },
    canvas: "#f7f6fc",
    border: "#e7e4f3",
  },
  {
    id: "indigo",
    name: "Indigo",
    primary: {
      50: "#eef0fb",
      100: "#dde1f7",
      200: "#bcc3ef",
      400: "#7b86d8",
      500: "#4f46e5",
      600: "#434b95",
      700: "#363d7a",
    },
    ink: { 700: "#2a2d4a", 800: "#1a1c33", 900: "#0f1020", 950: "#0a0b16" },
    canvas: "#f6f7fc",
    border: "#e3e6f5",
  },
  {
    id: "teal",
    name: "Teal",
    primary: {
      50: "#effaf8",
      100: "#d3f3ee",
      200: "#a8e6dc",
      400: "#3fc2ad",
      500: "#14a38e",
      600: "#0d8a78",
      700: "#0b6e60",
    },
    ink: { 700: "#1f3a38", 800: "#14292a", 900: "#0b1a1b", 950: "#07100f" },
    canvas: "#f3faf9",
    border: "#dcebe8",
  },
  {
    id: "sunset",
    name: "Sunset",
    primary: {
      50: "#fff6ed",
      100: "#ffe8d1",
      200: "#ffcfa3",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
    },
    ink: { 700: "#3a2a22", 800: "#271b15", 900: "#18100c", 950: "#100a07" },
    canvas: "#fcf8f4",
    border: "#f0e4d9",
  },
];

export const defaultPaletteId = "violet";

export const getPalette = (id?: string | null): Palette =>
  palettes.find((palette) => palette.id === id) ?? palettes[0];
