import z from "https://deno.land/x/zod@v3.22.2/index.ts";
import { Context } from "oak";
import { auth, authSignIn, createAccount } from "../db/account.ts";
import { ValidateError } from "../errors/validate.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.2/ZodError.ts";
import { Session } from "oak_sessions";

const Auth = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(256),
});

type Auth = z.infer<typeof Auth>;

async function SignUp(ctx: Context) {
  const body: Auth = await ctx.request.body({ type: "json" }).value;

  try {
    Auth.parse(body);
    await createAccount({
      username: body.username,
      password: body.password,
      role: "user",
    });
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof ZodError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof ValidateError) {
      ctx.response.body = error.data;
      return;
    }
    console.error(error);
    ctx.response.status = 500;
  }
}

async function SignIn(ctx: Context) {
  const body: Auth = await ctx.request.body({ type: "json" }).value;

  try {
    Auth.parse(body);
    const account = await authSignIn(body.username, body.password);
    (<Session>ctx.state.session).set("username", account[0].username);
    (<Session>ctx.state.session).set("user_uuid", account[1]);
    (<Session>ctx.state.session).set("role", account[0].role);
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof ZodError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof ValidateError) {
      ctx.response.body = error.data;
      if (error.data.code == "forbidden") {
        ctx.response.status = 401;
      }
      return;
    }
    console.error(error);
    ctx.response.status = 500;
    return;
  }
}

export { SignUp, SignIn };
