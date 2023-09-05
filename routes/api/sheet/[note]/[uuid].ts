import { Handlers } from "$fresh/server.ts";
import { Data, WithSession } from "@/lib/session.ts";
import { Role } from "@/model/rule.ts";
import { validateSheet } from "@/lib/validation.ts";
import { changeSheetData, deleteSheet, getSheet } from "@/db/sheet.ts";
import { SheetNotFoundError } from "@/errors/sheet.ts";
import { ValidateError } from "@/errors/validate.ts";
import { z, ZodError } from "zod";
import { NoteNotFoundError } from "@/errors/note.ts";
import { NoRequiredFieldsError } from "@/errors/index.ts";

const InsertSheet = z.record(
  z.string(),
  z.string().or(z.boolean()).or(z.number()),
);

type InsertSheet = z.infer<typeof InsertSheet>;

export const handler: Handlers<Data, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state;

    const role: Role = session.get("role") ?? "guest";
    const uuid: string = session.get("user_uuid");

    try {
      await validateSheet({
        note: ctx.params.note,
        user: <string> uuid,
        role,
        action: "read",
        target: ctx.params.uuid,
      });
      const sheet = await getSheet(ctx.params.note, ctx.params.uuid);
      return new Response(JSON.stringify(sheet), {
        status: 200,
      });
    } catch (error) {
      if (error instanceof SheetNotFoundError) {
        return new Response(JSON.stringify(error), {
          status: 200,
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
      console.error(error);
      return new Response(JSON.stringify(error), {
        status: 500,
      });
    }
  },
  async PATCH(_req, ctx) {
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
          action: "update",
          target: ctx.params.uuid,
        },
        body,
      );
      await changeSheetData(ctx.params.note, ctx.params.uuid, body);
      return new Response("", {
        status: 200,
      });
    } catch (error) {
      if (
        error instanceof ZodError || error instanceof NoteNotFoundError ||
        error instanceof SheetNotFoundError ||
        error instanceof NoRequiredFieldsError
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
      console.error(error);
      return new Response("", {
        status: 500,
      });
    }
  },
  async DELETE(_req, ctx) {
    const { session } = ctx.state;

    const role: Role = session.get("role") ?? "guest";
    const uuid: string = session.get("user_uuid");

    try {
      await validateSheet({
        note: ctx.params.note,
        user: <string> uuid,
        role,
        action: "delete",
        target: ctx.params.uuid,
      });
      await deleteSheet(ctx.params.note, ctx.params.uuid);
      return new Response("", {
        status: 200,
      });
    } catch (error) {
      if (
        error instanceof NoteNotFoundError ||
        error instanceof SheetNotFoundError
      ) {
        return new Response(JSON.stringify(error), {
          status: 200,
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
      console.error(error);
      return new Response("", {
        status: 500,
      });
    }
  },
};
