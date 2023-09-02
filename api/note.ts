import z from "https://deno.land/x/zod@v3.22.2/index.ts";
import { Context, RouteParams } from "oak";
import { IsAdmin } from "../db/account.ts";
import {
  createNote,
  getColumns,
  getNoteInfo,
  getNoteRule,
} from "../db/note.ts";
import { Session } from "oak_sessions";
import { ValidateError } from "../errors/validate.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.2/ZodError.ts";
import { validateNote } from "../lib/validation.ts";
import { Role } from "../model/rule.ts";
import { NoteNotFoundError } from "../errors/note.ts";

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
    })
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

async function CreateNote(ctx: Context) {
  const body: NoteData = await ctx.request.body({ type: "json" }).value;

  const role = <Role>await (<Session>ctx.state.session).get("role");

  const uuid = await (<Session>ctx.state.session).get("user_uuid");
  if (!uuid) {
    ctx.response.status = 403;
    return;
  }

  try {
    NoteData.parse(body);
    await validateNote(
      {
        user: <string>uuid,
        note: body.name,
        role: <Role>role,
        action: "create",
      },
      /**@ts-ignore */
      body.columns
    );
    /**@ts-ignore */
    await createNote(body.name, body.columns, body.rule);
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
        ctx.response.status = 403;
      }
      return;
    }
    console.error(error);
    ctx.response.status = 500;
    return;
  }
}

async function GetNoteInfo(
  ctx: Context & { params: { [key: string]: string } }
) {
  const role = <Role>await (<Session>ctx.state.session).get("role");
  try {
    await validateNote({
      role: role,
      note: ctx.params.name,
      action: "read",
    });
    const info = await getNoteInfo(ctx.params.name);
    const columns = await getColumns(ctx.params.name);
    const rules = await getNoteRule(ctx.params.name);
    ctx.response.body = { info, columns, rules };
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof ValidateError) {
      ctx.response.body = error.data;
      if (error.data.code == "forbidden") {
        ctx.response.status = 403;
      }
      return;
    }
    if (error instanceof NoteNotFoundError) {
      ctx.response.status = 404;
      return;
    }
    console.error(error);
    ctx.response.status = 500;
    return;
  }
}

export { CreateNote, GetNoteInfo };
