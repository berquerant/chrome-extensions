/** The root error of bmctl. */
export class BaseError extends Error {
  constructor(e?: string) {
    super(e);
    this.name = new.target.name;
  }
}
export class UnknownError extends BaseError {}
export class UnreachableError extends UnknownError {}
