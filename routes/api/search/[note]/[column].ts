import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { getNoteRule } from "@/db/note.ts";
import { ValidateError } from "@/errors/validate.ts";
import { search } from "@/db/sheet.ts";
import { ColumnNotFoundError, NoteNotFoundError } from "@/errors/note.ts";

export const handler: Handlers<Data, WithSession> = {
  async GET(req, ctx) {
    const searchParams = new URLSearchParams(new URL(req.url).search);

    const value = searchParams.get("value") ?? undefined;
    const min = searchParams.get("min") ?? undefined;
    const max = searchParams.get("max") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = searchParams.get("limit") ?? undefined;

    try {
      const rules = await getNoteRule(ctx.params.note);
      if (rules?.read_rule?.auth == true) {
        throw new ValidateError({
          code: "forbidden",
        });
      }

      if (limit !== undefined) {
        if (Number(limit) <= 0) {
          throw new ValidateError({
            code: "too_small",
            expected: 1,
            received: Number(limit),
          });
        } else if (isNaN(Number(limit))) {
          throw new ValidateError({
            code: "invalid_type",
            expected: "number",
            received: "NaN",
          });
        }
      }
      const list = await search(ctx.params.note, ctx.params.column, {
        value,
        min,
        max,
        cursor,
        limit: limit ? Number(limit) : undefined,
      });
      return new Response(JSON.stringify(list), {
        status: 200,
      });
    } catch (error) {
      if (
        error instanceof NoteNotFoundError ||
        error instanceof ColumnNotFoundError
      ) {
        return new Response(JSON.stringify(error), {
          status: 400,
        });
      }
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
      console.log(error);
      return new Response(null, {
        status: 500,
      });
    }
  },
};
