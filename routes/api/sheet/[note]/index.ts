import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { z, ZodError } from "zod";
import { Role } from "@/model/rule.ts";
import { validateSheet } from "@/lib/validation.ts";
import { createSheet } from "@/db/sheet.ts";
import { NoteNotFoundError } from "@/errors/note.ts";
import { NoRequiredFieldsError } from "@/errors/index.ts";
import { ValidateError } from "@/errors/validate.ts";

const InsertSheet = z.record(
  z.string(),
  z.string().or(z.boolean()).or(z.number()),
);

type InsertSheet = z.infer<typeof InsertSheet>;

export const handler: Handlers<Data, WithSession> = {
  async POST(_req, ctx) {
    const body: InsertSheet = await _req.json();
    const { session } = ctx.state;

    const role: Role = session.get("role") ?? "guest";
    const uuid: string = session.get("user_uuid");

    try {
      InsertSheet.parse(body);
      await validateSheet(
        {
          note: ctx.params.note,
          user: <string> uuid,
          role,
          action: "create",
        },
        body,
      );
      const sheet = await createSheet(ctx.params.note, body);
      return new Response(sheet, {
        status: 200,
      });
    } catch (error) {
      if (
        error instanceof ZodError || error instanceof NoRequiredFieldsError ||
        error instanceof NoteNotFoundError
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
      return new Response("", {
        status: 500,
      });
    }
  },
};
