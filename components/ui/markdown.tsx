import MarkdownDisplay from "@ronradtke/react-native-markdown-display";
import { useColorScheme } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { aliasFenceLanguages } from "@/utils/markdown-languages";

// Prism leaves plain tokens uncoloured, and Text doesn't inherit, so they'd render black on the dark block.
const plainCodeColor = { light: "#383a42", dark: "#abb2bf" };

type Props = {
  children: string;
  /** Body text size; headings and code scale from it. */
  size?: number;
  /** Centre the text, as on the quiz card. */
  centered?: boolean;
  bold?: boolean;
};

/** Renders a card's text as markdown: code blocks (highlighted), inline code, lists, bold, links. */
export const Markdown = ({
  children,
  size = 16,
  centered = false,
  bold = false,
}: Props) => {
  const scheme = useColorScheme() ?? "light";
  const { text, primary, surface, border } = useAppTheme();

  return (
    <MarkdownDisplay
      colorScheme={scheme}
      style={{
        body: {
          color: text,
          fontSize: size,
          lineHeight: Math.round(size * 1.45),
          textAlign: centered ? "center" : "left",
          fontWeight: bold ? "700" : "400",
        },
        paragraph: { marginTop: 0, marginBottom: 4 },
        link: { color: primary },
        strong: { fontWeight: "700" },
        code_inline: {
          color: text,
          backgroundColor: surface,
          borderColor: border,
          borderRadius: 4,
          fontFamily: "Menlo",
          fontSize: Math.round(size * 0.9),
        },
        fence: { borderColor: border, borderRadius: 10, marginVertical: 8 },
        fence_token: {
          color: plainCodeColor[scheme],
          fontSize: Math.round(size * 0.82),
        },
      }}
    >
      {aliasFenceLanguages(children)}
    </MarkdownDisplay>
  );
};
