/** The base error class of this package. */
export class BaseError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}

/** An error when function is not implemented yet. */
export class NotImplementedError extends BaseError {}

/** An error when cause is unknown  */
export class UnknownError extends BaseError {}
