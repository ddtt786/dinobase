type ColumnSelector = ["column", string, string];
type ColumnListSelector = ["column", string];

type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "file"
  | "timestamp"
  | "auth";

interface Column {
  type: ColumnType;
  relation?: [string, string?];
  unique?: boolean;
  min?: number;
  max?: number;
  lock?: boolean;
  optional?: boolean;
}

interface Columns {
  [key: string]: Column;
}

export type { Column, ColumnListSelector, Columns, ColumnSelector, ColumnType };
