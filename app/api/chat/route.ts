import { cookies } from "next/headers";
import { z } from "zod";
import type { ServerConfig } from "../_server/config";
import { jsonError } from "../_server/http";
import {
  createSession,
  getOrCreateSession,
  setSessionCookies,
  type Session,
  type SessionState,
} from "../_server/session";
import {
  fetchBackend,
  passthrough,
  requireServerConfig,
  type FetchOrResponse,
} from "../_server/upstream";
import {
  ChatRequestSchema,
  MAX_REQUEST_BODY_BYTES,
} from "../../../lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatBody = z.infer<typeof ChatRequestSchema>;

type BodyOrResponse =
  { ok: true; value: ChatBody } | { ok: false; response: Response };
type ChatResult =
  | { ok: true; response: Response; setSessionOnResponse: Session | null }
  | { ok: false; response: Response };

function requestTooLargeResponse(): Response {
  return jsonError(
    413,
    "REQUEST_TOO_LARGE",
    "Request is too large. Please shorten your message."
  );
}

async function parseChatBody(req: Request): Promise<BodyOrResponse> {
  const contentLength = Number(req.headers.get("content-length") ?? "");
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BODY_BYTES
  ) {
    return { ok: false, response: requestTooLargeResponse() };
  }

  try {
    const rawText = await req.text();
    if (new TextEncoder().encode(rawText).byteLength > MAX_REQUEST_BODY_BYTES) {
      return { ok: false, response: requestTooLargeResponse() };
    }

    const parsedBody = ChatRequestSchema.safeParse(JSON.parse(rawText));
    if (parsedBody.success) return { ok: true, value: parsedBody.data };

    const issue = parsedBody.error.issues[0];
    const field = issue?.path[0];
    return {
      ok: false,
      response: jsonError(
        422,
        "VALIDATION_ERROR",
        "Please correct the highlighted fields.",
        field !== undefined
          ? { [String(field)]: issue.message }
          : z.treeifyError(parsedBody.error)
      ),
    };
  } catch {
    return {
      ok: false,
      response: jsonError(400, "BAD_REQUEST", "Invalid JSON body."),
    };
  }
}

async function sendChat(
  cfg: ServerConfig,
  body: ChatBody,
  session: Session
): Promise<FetchOrResponse> {
  return fetchBackend(cfg, `${cfg.backendUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cfg.apiKey,
      "x-session-id": session.session_id,
      "x-session-token": session.session_token,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function executeChat(
  cfg: ServerConfig,
  body: ChatBody,
  sessionState: SessionState
): Promise<ChatResult> {
  let upstream = await sendChat(cfg, body, sessionState.session);
  if (!upstream.ok) return upstream;
  if (upstream.response.status !== 401) {
    return {
      ok: true,
      response: upstream.response,
      setSessionOnResponse: sessionState.setSessionOnResponse,
    };
  }

  const refreshed = await createSession(cfg);
  if (!refreshed.ok) return refreshed;
  upstream = await sendChat(cfg, body, refreshed.value);
  if (!upstream.ok) return upstream;
  return {
    ok: true,
    response: upstream.response,
    setSessionOnResponse: refreshed.value,
  };
}

export async function POST(req: Request) {
  const cfg = requireServerConfig();
  if (!cfg.ok) return cfg.response;

  const parsedBody = await parseChatBody(req);
  if (!parsedBody.ok) return parsedBody.response;

  const jar = await cookies();
  const sessionResult = await getOrCreateSession(cfg.value, jar);
  if (!sessionResult.ok) return sessionResult.response;
  const sessionState = sessionResult.value;

  const result = await executeChat(cfg.value, parsedBody.value, sessionState);
  if (!result.ok) return result.response;

  const resp = await passthrough(result.response);
  if (result.setSessionOnResponse) {
    setSessionCookies(resp, result.setSessionOnResponse);
  }

  return resp;
}
