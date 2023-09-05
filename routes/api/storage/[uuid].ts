import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { Data } from "@/lib/session.ts";
import { Role } from "@/model/rule.ts";
import { validateSheet } from "@/lib/validation.ts";
import { removeFile } from "@/db/storage.ts";
import { ValidateError } from "@/errors/validate.ts";
import { ColumnNotFoundError } from "@/errors/note.ts";
import { SheetNotFoundError } from "@/errors/sheet.ts";

export const handler: Handlers<Data, WithSession> = {
  async DELETE(_req, ctx) {
    const { session } = ctx.state;

    const uuid: string = session.get("user_uuid");
    const role: Role = session.get("role") ?? "guest";

    try {
      await validateSheet(
        {
          action: "delete",
          note: "storage",
          role,
          user: uuid,
          target: ctx.params.uuid,
        },
      );
      await removeFile(ctx.params.uuid);
      return new Response(null, {
        status: 204,
      });
    } catch (error) {
      if (error instanceof SheetNotFoundError) {
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
