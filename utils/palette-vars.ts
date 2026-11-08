import { vars } from "nativewind";
import { Palette } from "@/constants/palettes";

// "#6a45f5" -> "106 69 245", the channel format tailwind's rgb(var(--x) / <alpha-value>) expects
export const toChannels = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

/** The CSS variables behind tailwind's primary-*, ink-* and canvas colours. */
export const paletteVars = (palette: Palette) =>
  vars({
    ...Object.fromEntries(
      Object.entries(palette.primary).map(([shade, hex]) => [
        `--primary-${shade}`,
        toChannels(hex),
      ]),
    ),
    ...Object.fromEntries(
      Object.entries(palette.ink).map(([shade, hex]) => [
        `--ink-${shade}`,
        toChannels(hex),
      ]),
    ),
    "--canvas": toChannels(palette.canvas),
  });
