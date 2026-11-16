import { act, create } from "react-test-renderer";

import { developerSiteUrl } from "@/lib/developer-site";
import { DeveloperLink } from "../developer-link";

const mockOpen = jest.fn();

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpen(...args),
}));
jest.mock("@react-native-vector-icons/feather", () => () => null);

describe("DeveloperLink", () => {
  it("opens the developer's site in the browser", () => {
    let tree!: ReturnType<typeof create>;
    act(() => {
      tree = create(<DeveloperLink />);
    });

    act(() =>
      tree.root
        .findByProps({ accessibilityLabel: "More apps by Chidi" })
        .props.onPress(),
    );

    expect(mockOpen).toHaveBeenCalledWith(developerSiteUrl);
  });
});
