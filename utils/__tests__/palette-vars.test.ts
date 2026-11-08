import { toChannels } from "../palette-vars";

describe("toChannels", () => {
  it("turns a hex colour into space-separated rgb channels", () => {
    expect(toChannels("#6a45f5")).toBe("106 69 245");
    expect(toChannels("#000000")).toBe("0 0 0");
    expect(toChannels("#ffffff")).toBe("255 255 255");
  });
});
