import { BaseError } from "./Err";

export class InvalidNumberError extends BaseError {}

/**
 * A sort of rough, small internal functional library.
 */

export type Mapper<T, U> = (a: T) => U;
export type Predicate<T> = Mapper<T, boolean>;
export type Comparer<T> = (a: T, b: T) => number;
export type UndefComparer<T> = (a?: T, b?: T) => number;

export type None = {
  ok: false;
};
export const None = {
  ok: false,
} as const;
export type Some<T> = {
  ok: true;
  value: T;
};
/** Limited Maybe. Due to optional parameters are difficult to use in bmctl context. */
export type Option<T> = Some<T> | None;

export function asOptional<T>(v: Option<T>): T | undefined {
  return v.ok ? v.value : undefined;
}

export type Err = {
  ok: false;
  value: Error;
};
export type Ok<T> = {
  ok: true;
  value: T;
};
/** Limited Either. */
export type Result<T> = Ok<T> | Err;

export function tautology<T>(a: T): boolean {
  return true;
}

export function reverseComparer<T>(f: Comparer<T>): Comparer<T> {
  return (a: T, b: T) => f(b, a);
}

/**
 * New [[UndefComparer]].
 * Treat `undefined` as the minimum value.
 * @param f Original comparer
 **/
export function expandComparer<T>(f: Comparer<T>): UndefComparer<T> {
  return (a?: T, b?: T) => {
    const aUndef = a === undefined;
    const bUndef = b === undefined;
    if (aUndef !== bUndef) {
      return bUndef ? 1 : -1;
    }
    return aUndef ? 0 : f(a, b);
  };
}

export function numberComparer(a: number, b: number): number {
  return a - b;
}

export function stringComparer(a: string, b: string): number {
  return a.localeCompare(b);
}

export function toNumber(v: unknown): Result<number> {
  if (typeof v === "number") {
    return {
      ok: true,
      value: v as number,
    };
  }
  if (typeof v === "string") {
    const i = parseInt(v);
    if (!isNaN(i)) {
      return {
        ok: true,
        value: i as number,
      };
    }
  }
  return {
    ok: false,
    value: new InvalidNumberError(String(v)),
  };
}
