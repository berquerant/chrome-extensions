import { Result, Ok, Err } from "@/common/Function";
import { BaseError } from "@/common/Err";

export class InvalidTimestringError extends BaseError {}

/** yyyy-mm-dd */
type Timestring = string;

export function timestringToDate(s: Timestring): Result<Date> {
  try {
    const v = s.split("-").map((x) => parseInt(x));
    if (v.length != 3 || v.some((x) => isNaN(x))) {
      return Err(new InvalidTimestringError(s));
    }
    const [y, m, d] = v;
    return Ok(new Date(y, m - 1, d));
  } catch (e) {
    return Err(new InvalidTimestringError(`${e} ${s}`));
  }
}

export function dateToTimestring(date: Date): Timestring {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
