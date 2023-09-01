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

export type { ColumnSelector, ColumnListSelector, Column, ColumnType };
