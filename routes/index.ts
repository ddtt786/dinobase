import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { getVariable } from "@/db/index.ts";

export const handler: Handlers<Data, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state;
    if (session.get("user_uuid")) {
      return new Response(null, {
        status: 307,
        headers: { Location: "/note" },
      });
    } else {
      if (await getVariable("init")) {
        return new Response(null, {
          status: 307,
          headers: { Location: "/signin" },
        });
      } else {
        return new Response(null, {
          status: 307,
          headers: { Location: "/signup" },
        });
      }
    }
  },
};
