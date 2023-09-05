import { Handlers } from "$fresh/server.ts";
import { z, ZodError } from "zod";
import { Data, WithSession } from "@/lib/session.ts";
import { validateNote } from "@/lib/validation.ts";
import { Role } from "@/model/rule.ts";
import {
  changeNote,
  deleteNote,
  getColumns,
  getNoteInfo,
  getNoteRule,
} from "@/db/note.ts";
import { Columns } from "@/model/column.ts";
import { ValidateError } from "@/errors/validate.ts";
import { NoteNotFoundError } from "@/errors/note.ts";

const rule = z.object({
  permission: z.union([
    z.literal("admin"),
    z.literal("user"),
    z.literal("guest"),
  ]),
  auth: z.boolean().optional(),
});

const NewNoteData = z.object({
  columns: z.record(
    z.string(),
    z.object({
      type: z.string().optional(),
      relation: z.array(z.string()).max(2).optional(),
      unique: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      lock: z.boolean().optional(),
      optional: z.boolean().optional(),
    }),
  ),
  rule: z
    .object({
      create_rule: rule,
      update_rule: rule,
      read_rule: rule,
      delete_rule: rule,
    })
    .optional(),
});

type NewNoteData = z.infer<typeof NewNoteData>;

export const handler: Handlers<Data, WithSession> = {
  async GET(_req, ctx) {
    const { session } = ctx.state;
    const role: Role = session.get("role") ?? "guest";

    try {
      await validateNote({
        role: role,
        note: ctx.params.note,
        action: "read",
      });
      const info = await getNoteInfo(ctx.params.note);
      const columns = await getColumns(ctx.params.note);
      const rules = await getNoteRule(ctx.params.note);
      return new Response(JSON.stringify({ info, columns, rules }), {
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
      if (error instanceof NoteNotFoundError) {
        return new Response(JSON.stringify(error), {
          status: 404,
        });
      }
      console.error(error);
      return new Response(error.name, {
        status: 500,
      });
    }
  },
  async PATCH(_req, ctx) {
    const body: NewNoteData = await _req.json();
    const { session } = ctx.state;

    const role: Role = session.get("role") ?? "guest";

    try {
      NewNoteData.parse(body);
      await validateNote(
        {
          note: ctx.params.note,
          role: role as Role,
          action: "update",
        },
        body.columns as Columns,
      );
      await changeNote(
        ctx.params.note,
        body.columns as Columns,
        body.rule,
      );
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
  async DELETE(_req, ctx) {
    const { session } = ctx.state;

    const role: Role = session.get("role") ?? "guest";

    try {
      await validateNote({
        note: ctx.params.note,
        role: role as Role,
        action: "delete",
      });
      await deleteNote(ctx.params.note);
      return new Response("", {
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
