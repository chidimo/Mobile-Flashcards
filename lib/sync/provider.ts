export type RemoteFile = { name: string; revision: string };

/** Thrown by `write` when the file changed since `ifRevision`: someone else wrote in between. */
export class ConflictError extends Error {
  constructor(name: string) {
    super(`${name} changed on the remote since it was read`);
    this.name = "ConflictError";
  }
}

/**
 * A place to keep the sync files: one app-scoped folder in the person's Drive, Dropbox or OneDrive.
 * The engine only talks to this, so adding a provider is auth plus a few fetch calls.
 */
export interface StorageProvider {
  /** Every file in the app folder, with its current revision. */
  list(): Promise<RemoteFile[]>;
  read(name: string): Promise<{ content: string; revision: string }>;
  /** Creates or replaces a file. With `ifRevision`, throws ConflictError if it moved on. */
  write(
    name: string,
    content: string,
    ifRevision?: string,
  ): Promise<{ revision: string }>;
}

/** A storage service the person can connect: how to sign in, get back in silently, and sign out. */
export interface ProviderDefinition {
  id: string;
  label: string;
  /** False when this build has no client ID for it; the option is hidden. */
  isConfigured(): boolean;
  /** Interactive sign-in. */
  connect(): Promise<StorageProvider>;
  /** Back in without a prompt (a stored session), or null if the person must connect again. */
  restore(): Promise<StorageProvider | null>;
  disconnect(): Promise<void>;
}
