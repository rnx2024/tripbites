// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import {
  createSession,
  getOrCreateSession,
  setSessionCookies,
  type Session,
} from "./session";
import { fetchBackend } from "./upstream";

vi.mock("./upstream", async () => {
  const actual =
    await vi.importActual<typeof import("./upstream")>("./upstream");
  return { ...actual, fetchBackend: vi.fn() };
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

const config = {
  backendUrl: "http://backend.test",
  apiKey: "test-key",
  backendTimeoutMs: 5000,
};

const session: Session = {
  session_id: "session-id",
  session_token: "session-token",
};

function cookieJar(values: Record<string, string> = {}) {
  return {
    get: (name: string) => (values[name] ? { value: values[name] } : undefined),
  };
}

describe("getOrCreateSession", () => {
  it("uses both existing cookies without creating a backend session", async () => {
    const result = await getOrCreateSession(
      config,
      cookieJar({ tb_sid: session.session_id, tb_stk: session.session_token })
    );

    expect(result).toEqual({
      ok: true,
      value: { session, setSessionOnResponse: null },
    });
    expect(fetchBackend).not.toHaveBeenCalled();
  });

  it("creates a session when either cookie is missing", async () => {
    vi.mocked(fetchBackend).mockResolvedValue({
      ok: true,
      response: new Response(JSON.stringify(session), { status: 200 }),
    });

    const result = await getOrCreateSession(config, cookieJar());

    expect(result).toEqual({
      ok: true,
      value: { session, setSessionOnResponse: session },
    });
    expect(fetchBackend).toHaveBeenCalledWith(
      config,
      "http://backend.test/session",
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("createSession", () => {
  it("normalizes an invalid backend session response", async () => {
    vi.mocked(fetchBackend).mockResolvedValue({
      ok: true,
      response: new Response(JSON.stringify({ invalid: true }), {
        status: 200,
      }),
    });

    const result = await createSession(config);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(502);
      expect(await result.response.json()).toMatchObject({
        error: { code: "UPSTREAM_SESSION_INVALID" },
      });
    }
  });
});

describe("setSessionCookies", () => {
  it("sets HttpOnly strict cookies scoped to the application", () => {
    const response = NextResponse.json({ ok: true });

    setSessionCookies(response, session);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("tb_sid=session-id");
    expect(setCookie).toContain("tb_stk=session-token");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=strict");
    expect(setCookie).toContain("Path=/");
  });
});
