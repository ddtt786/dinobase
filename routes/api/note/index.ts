import { Handlers, RouteConfig } from "$fresh/server.ts";
import { z, ZodError } from "zod";
import { Data, WithSession } from "@/lib/session.ts";
import { validateNote } from "@/lib/validation.ts";
import { Role } from "@/model/rule.ts";
import { createNote } from "@/db/note.ts";
import { Columns } from "@/model/column.ts";
import { ValidateError } from "@/errors/validate.ts";

const rule = z.object({
  permission: z.union([
    z.literal("admin"),
    z.literal("user"),
    z.literal("guest"),
  ]),
  auth: z.boolean().optional(),
});

const NoteData = z.object({
  name: z.string(),
  columns: z.record(
    z.string(),
    z.object({
      type: z.string(),
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

type NoteData = z.infer<typeof NoteData>;

export const handler: Handlers<Data, WithSession> = {
  async POST(_req, ctx) {
    const body: NoteData = await _req.json();
    const { session } = ctx.state;

    const role: Role = session.get("role") ?? "guest";

    try {
      NoteData.parse(body);
      await validateNote(
        {
          note: body.name,
          role: role,
          action: "create",
        },
        body.columns as Columns,
      );
      await createNote(
        body.name,
        body.columns as Columns,
        body.rule,
      );
      return new Response("", { status: 200 });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(JSON.stringify(error), { status: 400 });
      }
      if (error instanceof ValidateError) {
        if (error.data.code == "forbidden") {
          return new Response(JSON.stringify(error.data), { status: 403 });
        }
        return new Response(JSON.stringify(error.data), { status: 400 });
      }
      console.log(error);
      return new Response("", {
        status: 500,
      });
    }
  },
};
