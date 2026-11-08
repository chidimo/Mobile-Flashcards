export type StoreUpdate = {
  /** The newest version in the store. */
  version: string;
  /** Where to send the user to install it. */
  storeUrl: string;
};

type LookupResponse = {
  results?: { version?: string; trackViewUrl?: string }[];
};

/** "1.10.0" is newer than "1.9.2"; missing or non-numeric parts count as 0. */
export const isNewerVersion = (latest: string, installed: string) => {
  const parts = (version: string) =>
    version.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const a = parts(latest);
  const b = parts(installed);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
};

/** Apple's public lookup: the live App Store version for a bundle id. */
const latestOnAppStore = async (
  bundleId: string,
): Promise<StoreUpdate | null> => {
  // The timestamp keeps Apple's CDN from handing back a stale answer.
  const url = `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}&_=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`App Store lookup failed (${response.status})`);
  const { results } = (await response.json()) as LookupResponse;
  const app = results?.[0];
  if (!app?.version || !app.trackViewUrl) return null;
  return { version: app.version, storeUrl: app.trackViewUrl };
};

type CheckOptions = {
  platform: string;
  installedVersion: string;
  bundleId?: string;
};

/**
 * The store's newer version, or null when the app is current, not listed yet, or on a platform we can't check.
 * Only the App Store is supported: Google Play has no public lookup and needs its in-app updates module.
 */
export const checkForUpdate = async ({
  platform,
  installedVersion,
  bundleId,
}: CheckOptions): Promise<StoreUpdate | null> => {
  if (platform !== "ios" || !bundleId) return null;
  const latest = await latestOnAppStore(bundleId);
  return latest && isNewerVersion(latest.version, installedVersion)
    ? latest
    : null;
};
