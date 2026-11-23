import { createHttp, ensureOk, HttpError } from "../http";
import { header, queueFetch, res } from "./helpers";

const make = (...responses: Response[]) => {
  const { calls, fetchImpl } = queueFetch(...responses);
  const getToken = jest.fn(async (force: boolean) =>
    force ? "fresh" : "stale",
  );
  const sleeps: number[] = [];
  const http = createHttp({
    getToken,
    fetchImpl,
    sleep: async (ms) => void sleeps.push(ms),
  });
  return { calls, getToken, sleeps, http };
};

describe("createHttp", () => {
  it("sends the token", async () => {
    const { http, calls } = make(res(200));
    await http("https://x/a");
    expect(header(calls[0], "Authorization")).toBe("Bearer stale");
  });

  it("retries once with a fresh token after a 401", async () => {
    const { http, calls, getToken } = make(res(401), res(200, "ok"));

    const response = await http("https://x/a");

    expect(response.status).toBe(200);
    expect(getToken).toHaveBeenLastCalledWith(true);
    expect(header(calls[1], "Authorization")).toBe("Bearer fresh");
  });

  it("gives up after a second 401", async () => {
    const { http, calls } = make(res(401), res(401));
    expect((await http("https://x/a")).status).toBe(401);
    expect(calls).toHaveLength(2);
  });

  it("waits as long as Retry-After says on a 429", async () => {
    const { http, sleeps } = make(
      res(429, "", { "retry-after": "3" }),
      res(200),
    );
    await http("https://x/a");
    expect(sleeps).toEqual([3000]);
  });

  it("backs off on 5xx and stops after three tries", async () => {
    const { http, calls, sleeps } = make(res(503), res(503), res(503));

    const response = await http("https://x/a");

    expect(response.status).toBe(503);
    expect(calls).toHaveLength(3);
    expect(sleeps).toEqual([500, 1000]);
  });

  it("returns other errors for the caller to read, untouched", async () => {
    const { http, calls } = make(res(404, "gone"));
    expect((await http("https://x/a")).status).toBe(404);
    expect(calls).toHaveLength(1);
  });
});

describe("ensureOk", () => {
  it("passes a good response through and throws a readable error otherwise", async () => {
    const ok = res(200);
    await expect(ensureOk(ok)).resolves.toBe(ok);
    await expect(ensureOk(res(500, "boom"))).rejects.toThrow(HttpError);
    await expect(ensureOk(res(500, "boom"))).rejects.toThrow("500");
  });
});
