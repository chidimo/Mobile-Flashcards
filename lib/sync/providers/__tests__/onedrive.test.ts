import { ConflictError } from "../../provider";
import { createHttp } from "../http";
import { createOneDriveProvider } from "../onedrive";
import { header, queueFetch, res } from "./helpers";

const make = (...responses: Response[]) => {
  const { calls, fetchImpl } = queueFetch(...responses);
  const http = createHttp({ getToken: async () => "tok", fetchImpl });
  return { calls, provider: createOneDriveProvider(http) };
};

describe("OneDrive provider", () => {
  it("lists files across pages and skips folders", async () => {
    const { provider, calls } = make(
      res(200, {
        value: [
          { name: "deck-a.json", eTag: "e1", file: {} },
          { name: "sub", eTag: "e0" },
        ],
        "@odata.nextLink": "https://graph.microsoft.com/next",
      }),
      res(200, { value: [{ name: "deck-b.json", eTag: "e2", file: {} }] }),
    );

    expect(await provider.list()).toEqual([
      { name: "deck-a.json", revision: "e1" },
      { name: "deck-b.json", revision: "e2" },
    ]);
    expect(calls[0].url).toContain("/special/approot/children");
    expect(calls[1].url).toBe("https://graph.microsoft.com/next");
  });

  it("reads the version, then the content", async () => {
    const { provider, calls } = make(res(200, { eTag: "e5" }), res(200, "{}"));

    expect(await provider.read("deck-a.json")).toEqual({
      content: "{}",
      revision: "e5",
    });
    expect(calls[0].url).toContain(
      "/special/approot:/deck-a.json?$select=eTag",
    );
    expect(calls[1].url).toContain("/special/approot:/deck-a.json:/content");
  });

  it("creates with conflictBehavior=fail and replaces with If-Match", async () => {
    const { provider, calls } = make(
      res(201, { eTag: "e1" }),
      res(200, { eTag: "e2" }),
    );

    await provider.write("deck-a.json", "body");
    await provider.write("deck-a.json", "body2", "e1");

    expect(calls[0].url).toContain("conflictBehavior=fail");
    expect(header(calls[0], "If-Match")).toBeUndefined();
    expect(calls[1].url).not.toContain("conflictBehavior");
    expect(header(calls[1], "If-Match")).toBe("e1");
    expect(calls[1].init.method).toBe("PUT");
  });

  it.each([412, 409])("turns a %s into a ConflictError", async (status) => {
    const { provider } = make(res(status));
    await expect(provider.write("deck-a.json", "x", "old")).rejects.toThrow(
      ConflictError,
    );
  });

  it("encodes odd characters in names", async () => {
    const { provider, calls } = make(res(200, { eTag: "e" }), res(200, ""));
    await provider.read("deck a#1.json");
    expect(calls[0].url).toContain("deck%20a%231.json");
  });
});
