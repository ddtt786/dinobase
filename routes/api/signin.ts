import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { z, ZodError } from "zod";
import { authSignIn } from "@/db/account.ts";
import { ValidateError } from "@/errors/validate.ts";
import { SheetNotFoundError } from "@/errors/sheet.ts";

const Auth = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(256),
});

type Auth = z.infer<typeof Auth>;

export const handler: Handlers<Data, WithSession> = {
  async POST(_req, ctx) {
    const body = await _req.json();
    const { session } = ctx.state;

    try {
      Auth.parse(body);
      const account = await authSignIn(body.username, body.password);
      session.set("username", account[0].username);
      session.set("user_uuid", account[1]);
      session.set("role", account[0].role);
      return new Response(account[1], {
        status: 200,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(JSON.stringify(error), {
          status: 400,
        });
      }
      if (error instanceof SheetNotFoundError) {
        return new Response(JSON.stringify(error), {
          status: 400,
        });
      }
      if (error instanceof ValidateError) {
        if (error.data.code == "forbidden") {
          return new Response(JSON.stringify(error.data), {
            status: 401,
          });
        }
        return new Response(JSON.stringify(error.data), {
          status: 400,
        });
      }
      console.error(error);
      return new Response(null, {
        status: 500,
      });
    }
  },
};
