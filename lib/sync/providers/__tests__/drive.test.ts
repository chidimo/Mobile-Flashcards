import { ConflictError } from "../../provider";
import { createDriveProvider } from "../drive";
import { createHttp } from "../http";
import { queueFetch, res } from "./helpers";

const make = (...responses: Response[]) => {
  const { calls, fetchImpl } = queueFetch(...responses);
  const http = createHttp({ getToken: async () => "tok", fetchImpl });
  return { calls, provider: createDriveProvider(http) };
};

const listing = (...files: { id: string; name: string; version: string }[]) =>
  res(200, { files });

describe("Drive provider", () => {
  it("lists the app data folder with versions as revisions", async () => {
    const { provider, calls } = make(
      listing({ id: "i1", name: "deck-a.json", version: "7" }),
    );

    expect(await provider.list()).toEqual([
      { name: "deck-a.json", revision: "7" },
    ]);
    expect(calls[0].url).toContain("spaces=appDataFolder");
  });

  it("follows page tokens", async () => {
    const { provider } = make(
      res(200, {
        files: [{ id: "i1", name: "deck-a.json", version: "1" }],
        nextPageToken: "p2",
      }),
      listing({ id: "i2", name: "deck-b.json", version: "2" }),
    );
    expect((await provider.list()).map((f) => f.name)).toEqual([
      "deck-a.json",
      "deck-b.json",
    ]);
  });

  it("keeps the lowest id when two files share a name", async () => {
    const { provider, calls } = make(
      listing(
        { id: "z9", name: "deck-a.json", version: "1" },
        { id: "a1", name: "deck-a.json", version: "2" },
      ),
      res(200, { version: "2" }),
      res(200, "body"),
    );

    expect(await provider.list()).toEqual([
      { name: "deck-a.json", revision: "2" },
    ]);
    await provider.read("deck-a.json");
    expect(calls[1].url).toContain("/files/a1?fields=version");
  });

  it("reads the version, then the content", async () => {
    const { provider } = make(
      listing({ id: "i1", name: "deck-a.json", version: "3" }),
      res(200, { version: "3" }),
      res(200, "{}"),
    );

    expect(await provider.read("deck-a.json")).toEqual({
      content: "{}",
      revision: "3",
    });
  });

  it("creates a new file in the app data folder", async () => {
    const { provider, calls } = make(
      listing(),
      res(200, { id: "n1", version: "1" }),
    );

    expect(await provider.write("deck-a.json", "body")).toEqual({
      revision: "1",
    });
    const upload = calls[1];
    expect(upload.url).toContain("uploadType=multipart");
    expect(upload.init.body).toContain('"parents":["appDataFolder"]');
    expect(upload.init.body).toContain("body");
  });

  it("replaces a file when its version is still the one expected", async () => {
    const { provider, calls } = make(
      listing({ id: "i1", name: "deck-a.json", version: "3" }),
      res(200, { version: "3" }),
      res(200, { version: "4" }),
    );

    expect(await provider.write("deck-a.json", "new", "3")).toEqual({
      revision: "4",
    });
    expect(calls[2].init.method).toBe("PATCH");
    expect(calls[2].url).toContain("/upload/drive/v3/files/i1");
  });

  it("refuses to replace a file whose version moved on", async () => {
    const { provider } = make(
      listing({ id: "i1", name: "deck-a.json", version: "5" }),
      res(200, { version: "5" }),
    );
    await expect(provider.write("deck-a.json", "x", "3")).rejects.toThrow(
      ConflictError,
    );
  });

  it("refuses to create a file that already exists, and to update one that was removed", async () => {
    const exists = make(
      listing({ id: "i1", name: "deck-a.json", version: "1" }),
    );
    await expect(exists.provider.write("deck-a.json", "x")).rejects.toThrow(
      ConflictError,
    );

    const removed = make(listing());
    await expect(
      removed.provider.write("deck-a.json", "x", "1"),
    ).rejects.toThrow(ConflictError);
  });

  it("says so when reading a file that isn't there", async () => {
    const { provider } = make(listing());
    await expect(provider.read("deck-a.json")).rejects.toThrow(
      "isn't in Drive",
    );
  });
});
