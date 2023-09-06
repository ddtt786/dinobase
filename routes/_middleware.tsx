import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { cookieSession, WithSession } from "fresh_session";

export type State = {} & WithSession;

const session = cookieSession();

function sessionHandler(_req: Request, ctx: MiddlewareHandlerContext<State>) {
  return session(_req, ctx);
}

async function cors(_req: Request, ctx: MiddlewareHandlerContext) {
  if (_req.method == "OPTIONS") {
    const resp = new Response(null, {
      status: 204,
    });
    const origin = _req.headers.get("Origin") || "*";
    const headers = resp.headers;
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "DELETE");
    return resp;
  }
  const origin = _req.headers.get("Origin") || "*";
  const resp = await ctx.next();
  const headers = resp.headers;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
  );
  headers.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS, GET, PUT, DELETE",
  );

  return resp;
}

export const handler = [sessionHandler, cors];
