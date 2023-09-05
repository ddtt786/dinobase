import { Handlers } from "$fresh/server.ts";
import { init } from "@/db/index.ts";
import { z, ZodError } from "zod";

const Auth = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(256),
});

type Auth = z.infer<typeof Auth>;

export const handler: Handlers = {
  async POST(_req) {
    const body: Auth = await _req.json();

    try {
      Auth.parse(body);
      if (
        (await init({
          username: body.username,
          password: body.password,
          role: "admin",
        })) == undefined
      ) {
        return new Response(null, {
          status: 400,
        });
      }
      return new Response(null, {
        status: 200,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(JSON.stringify(error), {
          status: 400,
        });
      }
      console.log(error);
      return new Response(null, {
        status: 500,
      });
    }
  },
};
