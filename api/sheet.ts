import z from "https://deno.land/x/zod@v3.22.2/index.ts";
import { Context } from "oak";
import { Role } from "../model/rule.ts";
import { Session } from "oak_sessions";
import { validateSheet } from "../lib/validation.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.2/ZodError.ts";
import { ValidateError } from "../errors/validate.ts";
import { changeSheetData, createSheet, getSheet } from "../db/sheet.ts";
import { NoteNotFoundError } from "../errors/note.ts";
import { NoRequiredFieldsError } from "../errors/index.ts";
import { object } from "https://deno.land/x/zod@v3.22.2/types.ts";
import { SheetNotFoundError } from "../errors/sheet.ts";

const InsertSheet = z.record(
  z.string(),
  z.string().or(z.boolean()).or(z.number())
);

type InsertSheet = z.infer<typeof InsertSheet>;

async function CreateSheet(
  ctx: Context & { params: { [key: string]: string } }
) {
  const body: InsertSheet = await ctx.request.body({ type: "json" }).value;

  const role: Role =
    <Role>await (<Session>ctx.state.session).get("role") ?? "guest";

  const uuid = await (<Session>ctx.state.session).get("user_uuid");

  try {
    InsertSheet.parse(body);
    await validateSheet(
      {
        note: ctx.params.name,
        user: <string>uuid,
        role,
        action: "create",
      },
      body
    );
    const sheet = await createSheet(ctx.params.name, body);
    ctx.response.status = 200;
    ctx.response.body = sheet;
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof ZodError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof NoteNotFoundError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof NoRequiredFieldsError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof ValidateError) {
      ctx.response.body = Object.assign(error.data);
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

async function GetSheetData(
  ctx: Context & { params: { [key: string]: string } }
) {
  const role: Role =
    <Role>await (<Session>ctx.state.session).get("role") ?? "guest";

  const uuid = await (<Session>ctx.state.session).get("user_uuid");

  try {
    await validateSheet({
      note: ctx.params.note,
      user: <string>uuid,
      role,
      action: "read",
      target: ctx.params.uuid,
    });
    const sheet = await getSheet(ctx.params.note, ctx.params.uuid);
    ctx.response.status = 200;
    ctx.response.body = sheet;
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof SheetNotFoundError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof ValidateError) {
      ctx.response.body = Object.assign(error.data);
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

async function ChangeSheetData(
  ctx: Context & { params: { [key: string]: string } }
) {
  const body: InsertSheet = await ctx.request.body({ type: "json" }).value;

  const role: Role =
    <Role>await (<Session>ctx.state.session).get("role") ?? "guest";

  const uuid = await (<Session>ctx.state.session).get("user_uuid");

  try {
    InsertSheet.parse(body);
    await validateSheet(
      {
        note: ctx.params.note,
        user: <string>uuid,
        role,
        action: "update",
        target: ctx.params.uuid,
      },
      body
    );
    await changeSheetData(ctx.params.note, ctx.params.uuid, body);
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 400;
    if (error instanceof ZodError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof NoteNotFoundError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof NoRequiredFieldsError) {
      ctx.response.body = error;
      return;
    }
    if (error instanceof ValidateError) {
      ctx.response.body = Object.assign(error.data);
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

export { CreateSheet, GetSheetData, ChangeSheetData };
