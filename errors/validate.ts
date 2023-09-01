import { ColumnType } from "../model/column.ts";

type ValidationErrorCode =
  | "too_small"
  | "too_big"
  | "too_short"
  | "too_long"
  | "auth_failed"
  | "invalid_type"
  | "forbidden"
  | "conflict"
  | "relationship";

interface ValidateErrorData {
  key?: string;
  code: ValidationErrorCode;
  expected?: string | number | ColumnType;
  received?: string | number | ColumnType;
}

class ValidateError extends Error {
  data: ValidateErrorData;
  constructor(data: ValidateErrorData) {
    super("validation error");
    this.name = "ValidateError";
    this.data = data;
  }
}

export type { ValidationErrorCode };
export { ValidateError };
