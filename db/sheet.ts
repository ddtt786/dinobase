import { ColumnNotFoundError, NoteNotFoundError } from "../errors/note.ts";
import { SheetCreationError, SheetNotFoundError } from "../errors/sheet.ts";
import { NoteSelector } from "../model/note.ts";
import {
  SearchIndex,
  SearchIndexListSelector,
  SearchOptions,
} from "../model/search.ts";
import { Sheet, SheetSelector } from "../model/sheet.ts";
import { kv } from "./kv.ts";
import { ColumnExist, NoteExist, getColumns } from "./note.ts";

async function createSheet(note: string, sheet: Sheet): Promise<string> {
  if (!NoteExist(note)) throw new NoteNotFoundError(note);

  let atom = kv.atomic();

  const uuid = crypto.randomUUID();
  const columns = await getColumns(note);
  for (const key in columns) {
    const { type } = columns[key];
    if (type == "timestamp") {
      sheet[key] = Date.now();
    }
  }
  atom = atom.set(<SheetSelector>["sheet", note, uuid], sheet);

  for (const key in sheet) {
    const element = sheet[key];
    if (element === undefined) {
      delete sheet[key];
      continue;
    }
    atom = atom.set(
      <SearchIndex>["search_index", note, key, element, uuid],
      uuid
    );
  }

  if (!(await atom.commit()).ok) {
    throw new SheetCreationError("unknown error");
  }

  return uuid;
}

async function changeSheetData(note: string, uuid: string, sheet: Sheet) {
  if (!NoteExist(note)) throw new NoteNotFoundError(note);

  let atom = kv.atomic();

  const columns = await getColumns(note);
  for (const key in columns) {
    if (!sheet[key]) continue;
    const { type } = columns[key];
    if (type == "timestamp") {
      sheet[key] = Date.now();
    }
  }
  atom = atom.set(
    <SheetSelector>["sheet", note, uuid],
    Object.assign(await getSheet(note, uuid), sheet)
  );

  for (const key in sheet) {
    const element = sheet[key];
    atom = atom.set(
      <SearchIndex>["search_index", note, key, element, uuid],
      uuid
    );
  }

  if (!(await atom.commit()).ok) {
    throw new SheetCreationError("unknown error");
  }
}

async function getSheet(note: string, uuid: string): Promise<Sheet> {
  if (!NoteExist(note)) throw new NoteNotFoundError(note);

  const sheet = await kv.get(<SheetSelector>["sheet", note, uuid]);

  if (!sheet.versionstamp) {
    throw new SheetNotFoundError(uuid);
  }

  return <Sheet>sheet.value;
}

async function isUnique(
  note: string,
  column: string,
  value: string
): Promise<boolean> {
  const indexes = kv.list({
    prefix: <SearchIndexListSelector>["search_index", note, column, value],
  });
  for await (const _ of indexes) {
    return false;
  }
  return true;
}

async function search(
  note: string,
  column: string,
  options: SearchOptions
): Promise<{ data: string[]; cursor?: string }> {
  if (!(await ColumnExist(note, column))) {
    throw new ColumnNotFoundError(column);
  }
  const res: string[] = [];

  if (options.value) {
    const list = kv.list<string>({
      prefix: <SearchIndexListSelector>[
        "search_index",
        note,
        column,
        options.value,
      ],
    });
    for await (const { value } of list) {
      res.push(value);
    }
    return { data: res, cursor: list.cursor };
  }

  if (options.min && !options.max) {
    const list = kv.list<string>(
      {
        start: ["search_index", note, column, options.min],
        prefix: ["search_index", note, column],
      },
      {
        limit: options.limit,
        cursor: options.cursor,
        reverse: true,
      }
    );

    for await (const { value } of list) {
      res.push(value);
    }
    return { data: res, cursor: list.cursor };
  }

  if (!options.min && options.max) {
    const list = kv.list<string>(
      {
        end: ["search_index", note, column, options.max],
        prefix: ["search_index", note, column],
      },
      {
        limit: options.limit,
        cursor: options.cursor,
        reverse: true,
      }
    );

    for await (const { value } of list) {
      res.push(value);
    }
    return { data: res, cursor: list.cursor };
  }

  if (options.min && options.max) {
    const list = kv.list<string>(
      {
        start: ["search_index", note, column, options.min],
        end: ["search_index", note, column, options.max],
      },
      {
        limit: options.limit,
        cursor: options.cursor,
        reverse: true,
      }
    );

    for await (const { value } of list) {
      res.push(value);
    }
    return { data: res, cursor: list.cursor };
  }

  if (options.limit) {
    const list = kv.list<string>(
      {
        prefix: ["search_index", note, column],
      },
      {
        limit: options.limit,
        cursor: options.cursor,
        reverse: true,
      }
    );

    for await (const { value } of list) {
      res.push(value);
    }
    return { data: res, cursor: list.cursor };
  }

  return { data: res };
}

export { createSheet, getSheet, isUnique, search, changeSheetData };
