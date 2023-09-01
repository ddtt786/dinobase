class NotFoundError extends Error {
  constructor(error: string) {
    super(error);
    this.name = "NotFoundError";
  }
}

class AlreadyExistError extends Error {
  constructor(error: string) {
    super(error);
    this.name = "AlreadyExistError";
  }
}

class ConflictError extends Error {
  constructor(error: string) {
    super(error);
    this.name = "ConflictError";
  }
}

class NoRequiredFieldsError extends Error {
  constructor(fields: string[]) {
    super(`No required fields : ${fields}`);
    this.name = "NoRequiredFieldsError";
  }
}

export {
  NotFoundError,
  AlreadyExistError,
  ConflictError,
  NoRequiredFieldsError,
};
