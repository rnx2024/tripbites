import type { NextResponse } from "next/server";
import type { ServerConfig } from "./config";
import { jsonError } from "./http";
import { fetchBackend } from "./upstream";
import { SessionResponseSchema } from "../../../lib/schemas";

export type Session = { session_id: string; session_token: string };
export type SessionCookieJar = {
  get(name: string): { value: string } | undefined;
};

export type SessionState = {
  session: Session;
  setSessionOnResponse: Session | null;
};

export type SessionStateOrResponse =
  { ok: true; value: SessionState } | { ok: false; response: Response };

type SessionOrResponse =
  { ok: true; value: Session } | { ok: false; response: Response };

const isProduction = process.env.NODE_ENV === "production";

export async function createSession(
  cfg: ServerConfig
): Promise<SessionOrResponse> {
  const upstream = await fetchBackend(cfg, `${cfg.backendUrl}/session`, {
    method: "POST",
    headers: { "x-api-key": cfg.apiKey },
    cache: "no-store",
  });
  if (!upstream.ok) return upstream;

  if (!upstream.response.ok) {
    return {
      ok: false,
      response: jsonError(
        502,
        "UPSTREAM_SESSION_FAILED",
        `Backend session endpoint returned ${upstream.response.status}.`
      ),
    };
  }

  const data = await upstream.response.json();
  const parsed = SessionResponseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(
        502,
        "UPSTREAM_SESSION_INVALID",
        "Backend returned an invalid session response."
      ),
    };
  }

  return { ok: true, value: parsed.data };
}

function readSession(jar: SessionCookieJar): Session | null {
  const sessionId = jar.get("tb_sid")?.value;
  const sessionToken = jar.get("tb_stk")?.value;
  return sessionId && sessionToken
    ? { session_id: sessionId, session_token: sessionToken }
    : null;
}

export async function getOrCreateSession(
  cfg: ServerConfig,
  jar: SessionCookieJar
): Promise<SessionStateOrResponse> {
  const existingSession = readSession(jar);
  if (existingSession) {
    return {
      ok: true,
      value: { session: existingSession, setSessionOnResponse: null },
    };
  }

  const created = await createSession(cfg);
  if (!created.ok) return created;

  return {
    ok: true,
    value: { session: created.value, setSessionOnResponse: created.value },
  };
}

export function setSessionCookies(resp: NextResponse, session: Session): void {
  resp.cookies.set("tb_sid", session.session_id, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
  });
  resp.cookies.set("tb_stk", session.session_token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
  });
}
