export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Request failed (${status}): ${body.slice(0, 200)}`);
    this.name = "HttpError";
  }
}

type Options = {
  /** `forceRefresh` asks for a fresh token after a 401. */
  getToken: (forceRefresh: boolean) => Promise<string>;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
};

const MAX_TRIES = 3;
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/**
 * fetch with the person's token attached. A 401 gets one retry with a fresh token; 429 and 5xx back
 * off (honouring Retry-After) up to 3 tries. Other statuses are returned for the caller to read.
 */
export const createHttp = ({
  getToken,
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}: Options) => {
  return async (url: string, init: RequestInit = {}): Promise<Response> => {
    let token = await getToken(false);
    let refreshed = false;
    for (let attempt = 1; ; attempt++) {
      const response = await fetchImpl(url, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 && !refreshed) {
        refreshed = true;
        token = await getToken(true);
        continue;
      }
      if (RETRYABLE.has(response.status) && attempt < MAX_TRIES) {
        const wait = Number(response.headers.get("Retry-After"));
        await sleep(wait > 0 ? wait * 1000 : 500 * 2 ** (attempt - 1));
        continue;
      }
      return response;
    }
  };
};

export type Http = ReturnType<typeof createHttp>;

/** Throws an HttpError for any non-2xx response. */
export const ensureOk = async (response: Response) => {
  if (!response.ok) throw new HttpError(response.status, await response.text());
  return response;
};
