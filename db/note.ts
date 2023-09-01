import { object } from "https://deno.land/x/zod@v3.22.2/types.ts";
import { NoteAlreadyExistError, NoteNotFoundError } from "../errors/note.ts";
import { Column, ColumnListSelector, ColumnSelector } from "../model/column.ts";
import { Note, NoteSelector } from "../model/note.ts";
import { CURDRule, RuleSelector } from "../model/rule.ts";
import { Sheet, SheetListSelector } from "../model/sheet.ts";
import { kv } from "./kv.ts";
import { SearchIndexListSelector } from "../model/search.ts";

async function createNote(
  name: string,
  columns: { [key: string]: Column },
  rules?: CURDRule
) {
  if (await NoteExist(name)) {
    throw new NoteAlreadyExistError(name);
  }

  await kv.set(
    <NoteSelector>["note", name],
    <Note>{
      title: name,
      created_at: Date.now(),
    }
  );

  if (rules) await kv.set(<RuleSelector>["rule", name], rules);

  for (const key in columns) {
    const column = columns[key];
    if (column.type == "file") {
      column.relation = ["storage"];
      await kv.set(<ColumnSelector>["column", name, key], column);
      continue;
    }
    await kv.set(<ColumnSelector>["column", name, key], column);
  }
}

async function changeNote(
  name: string,
  columns: { [key: string]: Column },
  rules?: CURDRule
) {
  if (rules) {
    const oldRules = await getNoteRule(name);
    if (oldRules) {
      await kv.set(
        <RuleSelector>["rule", name],
        Object.assign(oldRules, rules)
      );
    } else {
      await kv.set(<RuleSelector>["rule", name], rules);
    }
  }

  for (const key in columns) {
    const column = columns[key];
    if (column.type == "file") {
      column.relation = ["storage"];
      await kv.set(<ColumnSelector>["column", name, key], column);
      continue;
    }
    await kv.set(<ColumnSelector>["column", name, key], column);
  }
}

async function removeNoteColumn(name: string, columns: string[]) {
  for (const key of columns) {
    await kv.delete(<ColumnSelector>["column", name, key]);
    const searchIndex = kv.list({
      prefix: ["search_index", name, key],
    });
    for await (const { key } of searchIndex) {
      await kv.delete(key);
    }

    const sheets = kv.list<Sheet>({
      prefix: <SheetListSelector>["sheet", name],
    });
    for await (const { key: _key, value } of sheets) {
      delete value[key];
      await kv.set(_key, value);
    }

    await kv.delete(<ColumnSelector>["column", name, key]);
  }
}

async function deleteNote(name: string) {
  const list = kv.list(
    { prefix: <SheetListSelector>["sheet", name] },
    { limit: Infinity }
  );

  for await (const { key } of list) {
    await kv.delete(key);
  }

  const columns = await getColumns(name);

  for (const key in columns) {
    await kv.delete(<ColumnSelector>["column", name, key]);
    const searchIndex = kv.list({
      prefix: ["search_index", name, key],
    });
    for await (const { key } of searchIndex) {
      await kv.delete(key);
    }
  }

  await kv.delete(<RuleSelector>["rule", name]);
  await kv.delete(<NoteSelector>["note", name]);
}

async function getNoteInfo(name: string): Promise<Note> {
  const info = await kv.get(<NoteSelector>["note", name]);
  if (!info.versionstamp) {
    throw new NoteNotFoundError(name);
  }
  return <Note>info.value;
}

async function getNoteRule(name: string): Promise<CURDRule | undefined> {
  const rule = await kv.get(<RuleSelector>["rule", name]);
  return <CURDRule>rule.value;
}

async function getColumns(note: string): Promise<{ [key: string]: Column }> {
  if (!(await NoteExist(note))) throw new NoteNotFoundError(note);

  const columns = kv.list<Column>({
    prefix: <ColumnListSelector>["column", note],
  });

  const res: { [key: string]: Column } = {};
  for await (const column of columns) {
    res[<string>column.key[2]] = column.value;
  }

  return res;
}

async function NoteExist(name: string): Promise<boolean> {
  const info = await kv.get(<NoteSelector>["note", name]);
  return !!info.versionstamp;
}

async function ColumnExist(name: string, column: string): Promise<boolean> {
  const info = await kv.get(<ColumnSelector>["column", name, column]);
  return !!info.versionstamp;
}

export {
  createNote,
  getNoteInfo,
  getNoteRule,
  getColumns,
  NoteExist,
  ColumnExist,
  deleteNote,
  changeNote,
  removeNoteColumn,
};
