import { ConflictError, RemoteFile, StorageProvider } from "../provider";
import { ensureOk, Http } from "./http";

const API = "https://api.dropboxapi.com/2";
const CONTENT = "https://content.dropboxapi.com/2";

type Entry = { ".tag": string; name: string; rev?: string };

// Dropbox wants non-ASCII in the Dropbox-API-Arg header escaped.
const arg = (value: unknown) =>
  JSON.stringify(value).replace(
    /[\u007f-￿]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );

/** Dropbox with the "App folder" permission: the files live in /Apps/<app>/, which is path "". */
export const createDropboxProvider = (http: Http): StorageProvider => ({
  async list() {
    const files: RemoteFile[] = [];
    let response = await ensureOk(
      await http(`${API}/files/list_folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "", recursive: false, limit: 2000 }),
      }),
    );
    for (;;) {
      const page = (await response.json()) as {
        entries: Entry[];
        cursor: string;
        has_more: boolean;
      };
      for (const e of page.entries) {
        if (e[".tag"] === "file" && e.rev)
          files.push({ name: e.name, revision: e.rev });
      }
      if (!page.has_more) return files;
      response = await ensureOk(
        await http(`${API}/files/list_folder/continue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cursor: page.cursor }),
        }),
      );
    }
  },

  async read(name) {
    const response = await ensureOk(
      await http(`${CONTENT}/files/download`, {
        method: "POST",
        headers: { "Dropbox-API-Arg": arg({ path: `/${name}` }) },
      }),
    );
    const meta = JSON.parse(
      response.headers.get("dropbox-api-result") ?? "{}",
    ) as { rev?: string };
    if (!meta.rev) throw new Error("Dropbox didn't say which version it sent.");
    return { content: await response.text(), revision: meta.rev };
  },

  async write(name, content, ifRevision) {
    const mode =
      ifRevision === undefined
        ? "add"
        : { ".tag": "update", update: ifRevision };
    const response = await http(`${CONTENT}/files/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": arg({
          path: `/${name}`,
          mode,
          autorename: false,
          mute: true,
        }),
      },
      body: content,
    });
    // "add" on an existing file, or "update" on a moved-on one, comes back as a path conflict.
    if (response.status === 409) throw new ConflictError(name);
    await ensureOk(response);
    const saved = (await response.json()) as { rev: string };
    return { revision: saved.rev };
  },
});
