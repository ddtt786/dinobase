import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { Role } from "@/model/rule.ts";
import { ValidateError } from "@/errors/validate.ts";
import { getNoteList } from "@/db/note.ts";

export const handler: Handlers<Data, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state;
    const role: Role = session.get("role") ?? "guest";
    try {
      if (role != "admin") {
        throw new ValidateError({
          code: "forbidden",
        });
      }
      return new Response(JSON.stringify(await getNoteList()), {
        status: 200,
      });
    } catch (error) {
      if (error instanceof ValidateError) {
        if (error.data.code == "forbidden") {
          return new Response(JSON.stringify(error.data), {
            status: 403,
          });
        }
        return new Response(JSON.stringify(error.data), {
          status: 400,
        });
      }
      console.error(error);
      return new Response("", {
        status: 500,
      });
    }
  },
};
