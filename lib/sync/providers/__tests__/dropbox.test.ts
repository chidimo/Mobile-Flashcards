import { ConflictError } from "../../provider";
import { createDropboxProvider } from "../dropbox";
import { createHttp } from "../http";
import { header, queueFetch, res } from "./helpers";

const make = (...responses: Response[]) => {
  const { calls, fetchImpl } = queueFetch(...responses);
  const http = createHttp({ getToken: async () => "tok", fetchImpl });
  return { calls, provider: createDropboxProvider(http) };
};

describe("Dropbox provider", () => {
  it("lists files across pages, ignoring folders", async () => {
    const { provider, calls } = make(
      res(200, {
        entries: [
          { ".tag": "file", name: "deck-a.json", rev: "r1" },
          { ".tag": "folder", name: "x" },
        ],
        cursor: "c1",
        has_more: true,
      }),
      res(200, {
        entries: [{ ".tag": "file", name: "deck-b.json", rev: "r2" }],
        cursor: "c2",
        has_more: false,
      }),
    );

    expect(await provider.list()).toEqual([
      { name: "deck-a.json", revision: "r1" },
      { name: "deck-b.json", revision: "r2" },
    ]);
    expect(JSON.parse(calls[0].init.body as string)).toMatchObject({
      path: "",
    });
    expect(calls[1].url).toContain("list_folder/continue");
    expect(JSON.parse(calls[1].init.body as string)).toEqual({ cursor: "c1" });
  });

  it("reads content and takes the revision from the result header", async () => {
    const { provider, calls } = make(
      res(200, "{}", { "dropbox-api-result": JSON.stringify({ rev: "r9" }) }),
    );

    expect(await provider.read("deck-a.json")).toEqual({
      content: "{}",
      revision: "r9",
    });
    expect(JSON.parse(header(calls[0], "Dropbox-API-Arg"))).toEqual({
      path: "/deck-a.json",
    });
  });

  it("creates with mode add and replaces with mode update on the given revision", async () => {
    const { provider, calls } = make(
      res(200, { rev: "r1" }),
      res(200, { rev: "r2" }),
    );

    expect(await provider.write("deck-a.json", "body")).toEqual({
      revision: "r1",
    });
    expect(await provider.write("deck-a.json", "body2", "r1")).toEqual({
      revision: "r2",
    });

    expect(JSON.parse(header(calls[0], "Dropbox-API-Arg")).mode).toBe("add");
    expect(JSON.parse(header(calls[1], "Dropbox-API-Arg")).mode).toEqual({
      ".tag": "update",
      update: "r1",
    });
    expect(JSON.parse(header(calls[1], "Dropbox-API-Arg")).autorename).toBe(
      false,
    );
    expect(calls[1].init.body).toBe("body2");
  });

  it("turns a path conflict into a ConflictError", async () => {
    const { provider } = make(
      res(409, { error_summary: "path/conflict/file/.." }),
    );
    await expect(provider.write("deck-a.json", "x", "old")).rejects.toThrow(
      ConflictError,
    );
  });

  it("surfaces other failures", async () => {
    const { provider } = make(
      res(500, "boom"),
      res(500, "boom"),
      res(500, "boom"),
    );
    await expect(provider.write("deck-a.json", "x")).rejects.toThrow("500");
  });
});
