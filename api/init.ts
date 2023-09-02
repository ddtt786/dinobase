import { Context } from "oak";
import { ZodError, z } from "zod";
import { init } from "../db/index.ts";

const Auth = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(256),
});

type Auth = z.infer<typeof Auth>;

async function Init(ctx: Context) {
  const body: Auth = await ctx.request.body({ type: "json" }).value;

  try {
    Auth.parse(body);
    if (
      (await init({
        username: body.username,
        password: body.password,
        role: "admin",
      })) == undefined
    ) {
      ctx.response.status = 400;
      return;
    }
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof ZodError) {
      ctx.response.body = error;
      return;
    }
    ctx.response.status = 500;
  }
}

export { Init };
