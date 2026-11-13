import { Platform } from "react-native";
import { act, create } from "react-test-renderer";

import { SupportLink } from "@/lib/support-links";
import { SupportSection } from "../support-section";

const mockOpen = jest.fn();

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpen(...args),
}));
jest.mock("@react-native-vector-icons/feather", () => () => null);

const link = (id: string, url: string): SupportLink => ({
  id,
  label: `Gift ${id}`,
  description: "",
  icon: "gift",
  url,
});

const render = (links: SupportLink[]) => {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<SupportSection links={links} />);
  });
  return tree;
};

const onAndroid = () => jest.replaceProperty(Platform, "OS", "android");

beforeEach(() => mockOpen.mockReset());
afterEach(() => jest.restoreAllMocks());

describe("SupportSection", () => {
  it("opens a link in the browser", () => {
    onAndroid();
    const tree = render([link("a", "https://example.com/a")]);

    act(() =>
      tree.root.findByProps({ accessibilityLabel: "Gift a" }).props.onPress(),
    );

    expect(mockOpen).toHaveBeenCalledWith("https://example.com/a");
  });

  it("leaves out links with no url", () => {
    onAndroid();
    const tree = render([link("a", ""), link("b", "https://example.com/b")]);

    expect(tree.root.findAllByProps({ accessibilityLabel: "Gift a" })).toEqual(
      [],
    );
    expect(
      tree.root.findAllByProps({ accessibilityLabel: "Gift b" }).length,
    ).toBeGreaterThan(0);
  });

  it("renders nothing when no link has a url", () => {
    onAndroid();
    expect(render([link("a", "")]).toJSON()).toBeNull();
  });

  it("renders nothing on iOS", () => {
    jest.replaceProperty(Platform, "OS", "ios");
    expect(render([link("a", "https://example.com/a")]).toJSON()).toBeNull();
  });
});
