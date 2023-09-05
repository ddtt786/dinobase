import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { z, ZodError } from "zod";
import { createAccount } from "@/db/account.ts";
import { ValidateError } from "@/errors/validate.ts";

const Auth = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(256),
});

type Auth = z.infer<typeof Auth>;

export const handler: Handlers<Data, WithSession> = {
  async POST(_req) {
    const body: Auth = await _req.json();

    try {
      Auth.parse(body);
      await createAccount({
        username: body.username,
        password: body.password,
        role: "user",
      });
      return new Response("", {
        status: 200,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(JSON.stringify(error), {
          status: 400,
        });
      }
      if (error instanceof ValidateError) {
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
