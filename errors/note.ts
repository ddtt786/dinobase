import { AlreadyExistError, NotFoundError } from "@/errors/index.ts";

class NoteNotFoundError extends NotFoundError {
  constructor(name: string) {
    super(`${name} note was not found.`);
    this.name = "NoteNotFoundError";
  }
}

class ColumnNotFoundError extends NotFoundError {
  constructor(column: string) {
    super(`${column} column was not found.`);
    this.name = "ColumnNotFoundError";
  }
}

class NoteAlreadyExistError extends AlreadyExistError {
  constructor(name: string) {
    super(`${name} note already exists.`);
    this.name = "NoteAlreadyExistError";
  }
}

export { ColumnNotFoundError, NoteAlreadyExistError, NoteNotFoundError };
