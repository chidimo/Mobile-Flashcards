import { ConflictError, RemoteFile, StorageProvider } from "../provider";
import { ensureOk, Http } from "./http";

const FILES = "https://www.googleapis.com/drive/v3/files";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

type DriveFile = { id: string; name: string; version: string };

/**
 * Google Drive's hidden app data folder (scope drive.appdata). Files are addressed by id, so names
 * are mapped to ids from the last list. Drive has no If-Match, so a write re-reads the version first:
 * a small window remains where two devices can both pass the check.
 */
export const createDriveProvider = (http: Http): StorageProvider => {
  const ids = new Map<string, string>();

  const list = async (): Promise<DriveFile[]> => {
    const found: DriveFile[] = [];
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({
        spaces: "appDataFolder",
        fields: "nextPageToken,files(id,name,version)",
        pageSize: "1000",
        ...(pageToken ? { pageToken } : {}),
      });
      const page = (await (
        await ensureOk(await http(`${FILES}?${params}`))
      ).json()) as {
        files: DriveFile[];
        nextPageToken?: string;
      };
      found.push(...page.files);
      pageToken = page.nextPageToken;
    } while (pageToken);
    // Drive allows two files with one name (two devices creating at once): the lowest id wins, everywhere.
    const byName = new Map<string, DriveFile>();
    for (const file of found) {
      const seen = byName.get(file.name);
      if (!seen || file.id < seen.id) byName.set(file.name, file);
    }
    ids.clear();
    for (const [name, file] of byName) ids.set(name, file.id);
    return [...byName.values()];
  };

  const idOf = async (name: string) => {
    if (!ids.has(name)) await list();
    return ids.get(name);
  };

  const versionOf = async (id: string) => {
    const meta = (await (
      await ensureOk(await http(`${FILES}/${id}?fields=version`))
    ).json()) as {
      version: string;
    };
    return meta.version;
  };

  return {
    async list(): Promise<RemoteFile[]> {
      return (await list()).map((f) => ({ name: f.name, revision: f.version }));
    },

    async read(name) {
      const id = await idOf(name);
      if (!id) throw new Error(`${name} isn't in Drive.`);
      const revision = await versionOf(id);
      const content = await ensureOk(await http(`${FILES}/${id}?alt=media`));
      return { content: await content.text(), revision };
    },

    async write(name, content, ifRevision) {
      const id = await idOf(name);
      if (!id) {
        // Creating. If the caller expected an existing file, it has been removed since.
        if (ifRevision !== undefined) throw new ConflictError(name);
        const boundary = "flashcards-sync-boundary";
        const body =
          `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
          `${JSON.stringify({ name, parents: ["appDataFolder"] })}\r\n` +
          `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
        const created = (await (
          await ensureOk(
            await http(`${UPLOAD}?uploadType=multipart&fields=id,version`, {
              method: "POST",
              headers: {
                "Content-Type": `multipart/related; boundary=${boundary}`,
              },
              body,
            }),
          )
        ).json()) as { id: string; version: string };
        ids.set(name, created.id);
        return { revision: created.version };
      }
      if (ifRevision === undefined || (await versionOf(id)) !== ifRevision) {
        throw new ConflictError(name);
      }
      const updated = (await (
        await ensureOk(
          await http(`${UPLOAD}/${id}?uploadType=media&fields=version`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: content,
          }),
        )
      ).json()) as { version: string };
      return { revision: updated.version };
    },
  };
};
