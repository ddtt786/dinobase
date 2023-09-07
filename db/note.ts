import { NoteAlreadyExistError, NoteNotFoundError } from "@/errors/note.ts";
import {
  Column,
  ColumnListSelector,
  Columns,
  ColumnSelector,
} from "@/model/column.ts";
import { Note, NoteSelector } from "@/model/note.ts";
import { CRUDRule, RuleSelector } from "@/model/rule.ts";
import { Sheet, SheetListSelector } from "@/model/sheet.ts";
import { kv } from "@/db/kv.ts";
import { deepmerge } from "deepmerge";

async function createNote(
  name: string,
  columns: Columns,
  rules?: CRUDRule,
) {
  if (await NoteExist(name)) {
    throw new NoteAlreadyExistError(name);
  }

  await kv.set(
    ["note", name] as NoteSelector,
    {
      title: name,
      created_at: Date.now(),
    } as Note,
  );

  if (rules) await kv.set(["rule", name] as RuleSelector, rules);

  for (const key in columns) {
    const column = columns[key];
    if (column.type == "file") {
      column.relation = ["storage"];
      await kv.set(["column", name, key] as ColumnSelector, column);
      continue;
    }
    await kv.set(["column", name, key] as ColumnSelector, column);
  }
}

async function changeNote(
  name: string,
  columns: Columns,
  rules?: CRUDRule,
) {
  if (rules) {
    const oldRules = await getNoteRule(name);
    if (oldRules) {
      await kv.set(
        ["rule", name] as RuleSelector,
        deepmerge(oldRules, rules),
      );
    } else {
      await kv.set(["rule", name] as RuleSelector, rules);
    }
  }

  for (const key in columns) {
    const column = columns[key];
    const original = (await kv.get(["column", name, key])).value as Column;
    Object.entries(column).forEach(([key, value]) => {
      if (value === null) {
        /**@ts-ignore */
        delete original[key];
        /**@ts-ignore */
        delete column[key];
      }
    });
    if (column.type == "file") {
      column.relation = ["storage"];
      await kv.set(
        ["column", name, key] as ColumnSelector,
        deepmerge(original, column),
      );
      continue;
    }
    await kv.set(
      ["column", name, key] as ColumnSelector,
      deepmerge(original, column),
    );
  }
}

async function removeNoteColumn(name: string, columns: string[]) {
  for (const key of columns) {
    await kv.delete(["column", name, key] as ColumnSelector);
    const searchIndex = kv.list({
      prefix: ["search_index", name, key],
    });
    for await (const { key } of searchIndex) {
      await kv.delete(key);
    }

    const sheets = kv.list<Sheet>({
      prefix: ["sheet", name] as SheetListSelector,
    });
    for await (const { key: _key, value } of sheets) {
      delete value[key];
      await kv.set(_key, value);
    }

    await kv.delete(["column", name, key] as ColumnSelector);
  }
}

async function deleteNote(name: string) {
  const list = kv.list(
    { prefix: ["sheet", name] as SheetListSelector },
    { limit: Infinity },
  );

  for await (const { key } of list) {
    await kv.delete(key);
  }

  const columns = await getColumns(name);

  for (const key in columns) {
    await kv.delete(["column", name, key] as ColumnSelector);
    const searchIndex = kv.list({
      prefix: ["search_index", name, key],
    });
    for await (const { key } of searchIndex) {
      await kv.delete(key);
    }
  }

  await kv.delete(["rule", name] as RuleSelector);
  await kv.delete(["note", name] as NoteSelector);
}

async function getNoteInfo(name: string): Promise<Note> {
  const info = await kv.get(["note", name] as NoteSelector);
  if (!info.versionstamp) {
    throw new NoteNotFoundError(name);
  }
  return info.value as Note;
}

async function getNoteList(): Promise<Note[]> {
  const list = kv.list({ prefix: ["note"] });
  const res: Note[] = [];
  for await (const { value } of list) {
    res.push(value as Note);
  }
  return res;
}

async function getNoteRule(name: string): Promise<CRUDRule | undefined> {
  const rule = await kv.get(["rule", name] as RuleSelector);
  return rule.value as CRUDRule;
}

async function getColumns(note: string): Promise<Columns> {
  if (!(await NoteExist(note))) throw new NoteNotFoundError(note);

  const columns = kv.list<Column>({
    prefix: ["column", note] as ColumnListSelector,
  });

  const res: Columns = {};
  for await (const column of columns) {
    res[column.key[2] as string] = column.value;
  }

  return res;
}

async function NoteExist(name: string): Promise<boolean> {
  const info = await kv.get(["note", name] as NoteSelector);
  return !!info.versionstamp;
}

async function ColumnExist(name: string, column: string): Promise<boolean> {
  const info = await kv.get(["column", name, column] as ColumnSelector);
  return !!info.versionstamp;
}

export {
  changeNote,
  ColumnExist,
  createNote,
  deleteNote,
  getColumns,
  getNoteInfo,
  getNoteList,
  getNoteRule,
  NoteExist,
  removeNoteColumn,
};
