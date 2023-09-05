import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";

export const handler: Handlers<Data, WithSession> = {
  async POST(_req, ctx) {
    const { session } = ctx.state;
    session.clear();
    return new Response(null, {
      status: 204,
    });
  },
};
