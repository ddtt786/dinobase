import { Sheet } from "../model/sheet.ts";
import { ConflictError, NotFoundError } from "./index.ts";

class SheetNotFoundError extends NotFoundError {
  constructor(uuid: string) {
    super(`${uuid} sheet was not found.`);
    this.name = "SheetNotFoundError";
  }
}

class SheetCreationError extends Error {
  constructor(error: string) {
    super(error);
    this.name = "SheetCreationError";
  }
}

class SheetConflictError extends ConflictError {
  existing: Sheet;
  received: Sheet;
  constructor(uuid: string, existing: Sheet, received: Sheet) {
    super(`${uuid} conflicts with existing`);
    this.name = "SheetConflictError";
    this.existing = existing;
    this.received = received;
  }
}

export { SheetNotFoundError, SheetCreationError, SheetConflictError };
