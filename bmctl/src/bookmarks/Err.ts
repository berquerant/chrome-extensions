import * as CErr from "../common/Err";

/** The root error of bookmarks. */
export class BaseError extends CErr.BaseError {}
export class UnknownError extends CErr.UnknownError {}
export class UnreachableError extends CErr.UnreachableError {}
export class RegExpError extends BaseError {}
