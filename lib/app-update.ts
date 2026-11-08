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

const playListing = (packageName: string) =>
  `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`;

/** The version in a Play listing page, which embeds it as `[[["1.2.0"]]`. */
export const parsePlayVersion = (html: string) =>
  /\[\[\["(\d+(?:\.\d+)+)"\]\]/.exec(html)?.[1];

/**
 * The live Google Play version for a package. Play has no public lookup, so this reads the public
 * listing page; if Google changes that page the version isn't found and the check fails visibly.
 */
const latestOnPlayStore = async (
  packageName: string,
): Promise<StoreUpdate | null> => {
  const response = await fetch(`${playListing(packageName)}&hl=en&gl=US`);
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Play Store lookup failed (${response.status})`);
  const version = parsePlayVersion(await response.text());
  if (!version) throw new Error("No version found on the Play Store page");
  return { version, storeUrl: playListing(packageName) };
};

type CheckOptions = {
  platform: string;
  installedVersion: string;
  /** The store id of this app: the bundle id on iOS, the package name on Android. */
  appId?: string;
};

type Provider = (appId: string) => Promise<StoreUpdate | null>;

// One lookup per platform.
const providers: Record<string, Provider | undefined> = {
  ios: latestOnAppStore,
  android: latestOnPlayStore,
};

/**
 * The store's newer version, or null when the app is current, not listed yet,
 * or the platform has no lookup yet.
 */
export const checkForUpdate = async ({
  platform,
  installedVersion,
  appId,
}: CheckOptions): Promise<StoreUpdate | null> => {
  const lookup = providers[platform];
  if (!lookup || !appId) return null;
  const latest = await lookup(appId);
  return latest && isNewerVersion(latest.version, installedVersion)
    ? latest
    : null;
};
