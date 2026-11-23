import { ConflictError, RemoteFile, StorageProvider } from "../provider";
import { ensureOk, Http } from "./http";

const ROOT = "https://graph.microsoft.com/v1.0/me/drive/special/approot";

const itemUrl = (name: string) => `${ROOT}:/${encodeURIComponent(name)}`;

/** OneDrive's app folder (`approot`), reached with the Files.ReadWrite.AppFolder scope. */
export const createOneDriveProvider = (http: Http): StorageProvider => ({
  async list() {
    const files: RemoteFile[] = [];
    let url: string | undefined =
      `${ROOT}/children?$select=name,eTag,file&$top=200`;
    while (url) {
      const page = (await (await ensureOk(await http(url))).json()) as {
        value: { name: string; eTag?: string; file?: unknown }[];
        "@odata.nextLink"?: string;
      };
      for (const item of page.value) {
        if (item.file && item.eTag)
          files.push({ name: item.name, revision: item.eTag });
      }
      url = page["@odata.nextLink"];
    }
    return files;
  },

  async read(name) {
    // The version first: if the file moves on before the content arrives, the stale version only
    // makes the next write conflict and retry.
    const meta = (await (
      await ensureOk(await http(`${itemUrl(name)}?$select=eTag`))
    ).json()) as {
      eTag: string;
    };
    const content = await ensureOk(await http(`${itemUrl(name)}:/content`));
    return { content: await content.text(), revision: meta.eTag };
  },

  async write(name, content, ifRevision) {
    // `fail` makes creating a file that now exists a conflict; If-Match guards replacing one.
    const query =
      ifRevision === undefined ? "?@microsoft.graph.conflictBehavior=fail" : "";
    const response = await http(`${itemUrl(name)}:/content${query}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(ifRevision === undefined ? {} : { "If-Match": ifRevision }),
      },
      body: content,
    });
    if (response.status === 412 || response.status === 409)
      throw new ConflictError(name);
    await ensureOk(response);
    const saved = (await response.json()) as { eTag: string };
    return { revision: saved.eTag };
  },
});
