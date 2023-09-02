import { NoteExist, getColumns, getNoteRule } from "../db/note.ts";
import { getSheet, search } from "../db/sheet.ts";
import { NoRequiredFieldsError } from "../errors/index.ts";
import { ColumnNotFoundError, NoteNotFoundError } from "../errors/note.ts";
import { SheetNotFoundError } from "../errors/sheet.ts";
import { ValidateError } from "../errors/validate.ts";
import { Column, ColumnType } from "../model/column.ts";
import { Role } from "../model/rule.ts";
import { Sheet } from "../model/sheet.ts";
import { z } from "zod";

type ActionType = "create" | "update" | "read" | "delete";

interface Expl {
  note: string;
  target?: string;
  user?: string; //uuid
  role: Role;
  action: ActionType;
}

async function validateNote(expl: Expl, columns?: { [key: string]: Column }) {
  if (expl.role != "admin") throw new ValidateError({ code: "forbidden" });
  if (await NoteExist(expl.note)) {
    if (expl.action == "read") return;
    if (expl.action == "create") {
      throw new ValidateError({ code: "conflict" });
    }
  }

  if ((expl.action == "create" || expl.action == "update") && !columns) {
    throw new NoRequiredFieldsError(["columns"]);
  }

  const target = await (async function (): Promise<
    { [key: string]: Column } | undefined
  > {
    if (expl.action == "create") {
      return <{ [key: string]: Column }>columns;
    }
    if (!expl.note) {
      throw new NoRequiredFieldsError(["note"]);
    }
    try {
      return await getColumns(expl.note);
    } catch (_) {
      return;
    }
  })();

  if (!target) {
    throw new NoteNotFoundError(expl.note);
  }

  if (expl.action == "delete" && !columns) {
    return;
  }

  for (const key in columns) {
    const { type, relation } = columns[key];
    if (expl.action == "update" && target[key]) {
      throw new ValidateError({
        code: "conflict",
      });
    }
    // deno-lint-ignore no-unused-vars
    const data = columns ? columns[key] : target[key];
    if ((expl.action == "delete" || expl.action == "update") && !columns[key])
      continue;
    if (expl.action == "delete" && !target[key]) {
      throw new ColumnNotFoundError(key);
    }
    const types: ColumnType[] = [
      "auth",
      "boolean",
      "file",
      "number",
      "string",
      "timestamp",
    ];
    if (!types.includes(type)) {
      throw new ValidateError({
        key,
        code: "invalid_type",
        expected: "type",
        received: type,
      });
    }
    if (relation) {
      const _columns = await getColumns(relation[0]);
      if (relation[1]) {
        const _column = _columns[relation[1]];
        if (!_column) {
          throw new ValidateError({
            key,
            code: "relationship",
            expected: relation[1],
          });
        }
        if (!_column.unique) {
          throw new ValidateError({
            key,
            code: "relationship",
            expected: "unique",
          });
        }
        if (type != _column.type) {
          throw new ValidateError({
            key,
            code: "relationship",
            expected: type,
            received: _column.type,
          });
        }
      } else {
        if (type != "string") {
          throw new ValidateError({
            key,
            code: "relationship",
            expected: type,
            received: "string",
          });
        }
      }
    }
  }
}

async function validateSheet(expl: Expl, sheet?: Sheet) {
  const rules = await getNoteRule(expl.note);
  const rule = rules ? rules[`${expl.action}_rule`] : undefined;
  switch (rule?.permission) {
    case "admin":
      if (expl.role != "admin") {
        throw new ValidateError({
          code: "forbidden",
        });
      }
      break;
    case "user":
      if (expl.role == "guest") {
        throw new ValidateError({
          code: "forbidden",
        });
      }
      break;
  }

  if ((expl.action == "create" || expl.action == "update") && !sheet) {
    throw new NoRequiredFieldsError(["sheet"]);
  }

  const target = await (async function (): Promise<Sheet | undefined> {
    if (expl.action == "create") {
      return sheet;
    }
    if (!expl.target) {
      throw new NoRequiredFieldsError(["target"]);
    }
    try {
      return await getSheet(expl.note, <string>expl.target);
    } catch (_) {
      return;
    }
  })();
  if (!target) {
    throw new SheetNotFoundError(expl.target ? <string>expl.target : "");
  }

  const columns = await getColumns(expl.note);
  for (const key in columns) {
    const { type, relation, unique, min, max, lock, optional } = columns[key];
    const data = sheet ? sheet[key] : target[key];

    if ((expl.action == "read" || expl.action == "delete") && type != "auth")
      continue;
    if (optional && !data) continue;
    if (expl.action == "update" && !data) continue;
    if (!optional && !data && type != "timestamp")
      throw new NoRequiredFieldsError([key]);
    if (lock && data) {
      throw new ValidateError({
        key,
        code: "conflict",
      });
    }
    if (
      unique &&
      (await search(expl.note, key, { value: <string>data })).data.length !=
        0 &&
      expl.action == "create"
    ) {
      throw new ValidateError({
        key,
        code: "conflict",
      });
    }

    switch (type) {
      case "string":
        if (!z.string().safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "invalid_type",
            expected: "string",
            received: typeof data,
          });
        }

        if (min && !z.string().min(min).safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "too_short",
            expected: min,
            received: (<string>data).length,
          });
        }

        if (max && !z.string().max(max).safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "too_long",
            expected: max,
            received: (<string>data).length,
          });
        }
        break;
      case "number":
        if (!z.number().safeParse(data).success) {
          throw new ValidateError({
            code: "invalid_type",
            expected: "number",
            received: typeof data,
          });
        }

        if (min && !z.number().min(min).safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "too_small",
            expected: min,
            received: <number>data,
          });
        }

        if (max && !z.number().max(max).safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "too_big",
            expected: max,
            received: <number>data,
          });
        }
        break;
      case "boolean":
        if (!z.boolean().safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "invalid_type",
            expected: "boolean",
            received: typeof data,
          });
        }
        break;

      case "auth":
        if (
          expl.user != target[key] &&
          rule?.auth != false &&
          expl.role != "admin"
        ) {
          throw new ValidateError({
            key,
            code: "invalid_type",
            expected: "auth",
            received: typeof data,
          });
        }
        break;

      case "file":
        if (!z.string().uuid().safeParse(data).success) {
          throw new ValidateError({
            key,
            code: "invalid_type",
            expected: "file",
            received: typeof data,
          });
        }
        break;

      case "timestamp":
        if (!z.number().or(z.boolean()).safeParse(data).success && data) {
          throw new ValidateError({
            key,
            code: "invalid_type",
            expected: "timestamp",
            received: typeof data,
          });
        }
        break;
    }
    if (relation && (expl.action == "create" || expl.action == "update")) {
      if (relation[1]) {
        const related = (
          await search(relation[0], relation[1], {
            value: <string>data,
          })
        ).data;
        try {
          const rel = await getSheet(relation[0], related[0]);
          if (!data == rel[relation[1]]) {
            throw new ValidateError({
              code: "relationship",
            });
          }
        } catch (_) {
          throw new ValidateError({
            code: "relationship",
          });
        }
      } else {
        try {
          await getSheet(relation[0], <string>data);
        } catch (_) {
          throw new ValidateError({
            code: "relationship",
          });
        }
      }
    }
  }
  if (sheet) {
    for (const key in sheet) {
      if (!columns[key]) {
        throw new ValidateError({
          code: "forbidden",
        });
      }
    }
  }
}

export type { ActionType, Expl };
export { validateSheet, validateNote };
