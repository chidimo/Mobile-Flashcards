export type Call = { url: string; init: RequestInit };

export const res = (
  status: number,
  body: unknown = "",
  headers: Record<string, string> = {},
): Response => {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        headers[name.toLowerCase()] ?? headers[name] ?? null,
    },
    text: async () => text,
    json: async () => JSON.parse(text),
  } as unknown as Response;
};

/** A fetch that answers from a queue and records every call. */
export const queueFetch = (...responses: Response[]) => {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (!next) throw new Error(`Unexpected request: ${url}`);
    return next;
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
};

export const header = (call: Call, name: string) =>
  (call.init.headers as Record<string, string>)[name];
