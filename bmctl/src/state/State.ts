import {
  QueryType,
  QueryTargetType,
  SortOrderType,
  SortType,
  FilterType,
} from "../bookmarks/Search";
import {
  Result,
  Ok,
  Err,
  toNumber,
  Option,
  None,
  Some,
} from "../common/Function";
import { BaseError } from "../common/Err";
import * as Log from "../log/Log";

export const OptionStateKey = {
  QueryType: "queryType",
  QueryTargetType: "queryTargetType",
  SortType: "sortType",
  SortOrderType: "sortOrderType",
  Filters: "filters",
  QuerySourceMaxResult: "querySourceMaxResult",
  QueryMaxResult: "queryMaxResult",
} as const;
export type OptionStateKey = typeof OptionStateKey[keyof typeof OptionStateKey];

/** bmtctl's configuration */
export interface IOptionState {
  readonly queryType: QueryType;
  readonly queryTargetType: QueryTargetType;
  readonly sortType: SortType;
  readonly sortOrderType: SortOrderType;
  readonly filters: ReadonlyArray<FilterType>;
  readonly querySourceMaxResult: Option<number>;
  readonly queryMaxResult: Option<number>;
}

/* option state converters, unknown to a kind of state */

export class InvalidQueryTypeError extends BaseError {}

export function toQueryType(v: unknown): Result<QueryType> {
  for (const x of Object.values(QueryType)) {
    if (x == v) {
      return Ok(x as QueryType);
    }
  }
  return Err(new InvalidQueryTypeError(String(v)));
}

export class InvalidQueryTargetTypeError extends BaseError {}

export function toQueryTargetType(v: unknown): Result<QueryTargetType> {
  for (const x of Object.values(QueryTargetType)) {
    if (x == v) {
      return Ok(x as QueryTargetType);
    }
  }
  return Err(new InvalidQueryTargetTypeError(String(v)));
}

export class InvalidSortTypeError extends BaseError {}

export function toSortType(v: unknown): Result<SortType> {
  for (const x of Object.values(SortType)) {
    if (x == v) {
      return Ok(x as SortType);
    }
  }
  return Err(new InvalidSortTypeError(String(v)));
}

export class InvalidSortOrderTypeError extends BaseError {}

export function toSortOrderType(v: unknown): Result<SortOrderType> {
  for (const x of Object.values(SortOrderType)) {
    if (x == v) {
      return Ok(x as SortOrderType);
    }
  }
  return Err(new InvalidSortOrderTypeError(String(v)));
}

export class InvalidFilterTypeError extends BaseError {}

export function toFilterType(v: unknown): Result<FilterType> {
  try {
    if (v["kind"] == "before" || v["kind"] == "after") {
      if (typeof v["timestamp"] === "number") {
        return Ok(v as FilterType);
      }
      if (typeof v["timestamp"] === "string") {
        const ts = parseInt(v["timestamp"]);
        if (!isNaN(ts)) {
          return Ok({
            kind: v["kind"],
            timestamp: ts,
          });
        }
      }
    }
    return Err(new InvalidFilterTypeError(String(v)));
  } catch (e) {
    return Err(new InvalidFilterTypeError(`${e} ${v}`));
  }
}
export function toNumberOptional(v: unknown): Result<Option<number>> {
  if (v === undefined) {
    return Ok(None);
  }
  const result = (u: unknown): Result<Option<number>> => {
    const r = toNumber(u);
    return r.ok ? Ok(Some(r.value)) : Err(r.value as Error);
  };
  if (typeof v === "object" && v !== null) {
    // for Option type check
    if ("ok" in v) {
      if (!v["ok"]) {
        return Ok(None);
      }
      if ("value" in v) {
        return result(v["value"]);
      }
    }
  }
  return result(v);
}
export const toQuerySourceMaxResult = toNumberOptional;
export const toQueryMaxResult = toNumberOptional;

/**
 * Utility to build [[IOptionState]].
 * Use default value if invalid values passed.
 */
export interface IOptionStateBuilder {
  /** Try to set queryType. */
  queryType(v: unknown): IOptionStateBuilder;
  /** Try to set queryTargetType. */
  queryTargetType(v: unknown): IOptionStateBuilder;
  /** Try to set sortType. */
  sortType(v: unknown): IOptionStateBuilder;
  /** Try to set sortOrderType. */
  sortOrderType(v: unknown): IOptionStateBuilder;
  /** Try to add filter. */
  addFilter(v: unknown): IOptionStateBuilder;
  /**
   * Try to set filters.
   * This clear filters, [[addFilter]] for each element.
   */
  filters(v: Array<unknown>): IOptionStateBuilder;
  /**
   * Try to set querySourceMaxResult.
   * Set querySourceMaxResult to undefined if undefined.
   */
  querySourceMaxResult(v: unknown): IOptionStateBuilder;
  /**
   * Try to set queryMaxResult.
   * Set queryMaxResult to undefined if undefined.
   */
  queryMaxResult(v: unknown): IOptionStateBuilder;
  /** Build a new [[IOptionState]]. */
  build(): IOptionState;
  /** Try to set properties from object. */
  fromObject(v: { [key: string]: unknown }): IOptionStateBuilder;
}

export function newIOptionStateBuilder(): IOptionStateBuilder {
  return new OptionStateBuilder();
}

class OptionStateBuilder implements IOptionStateBuilder {
  private queryTypeValue: QueryType;
  private queryTargetTypeValue: QueryTargetType;
  private sortTypeValue: SortType;
  private sortOrderTypeValue: SortOrderType;
  private filtersValue: Array<FilterType>;
  private querySourceMaxResultValue: Option<number>;
  private queryMaxResultValue: Option<number>;
  constructor() {
    this.queryTypeValue = QueryType.Raw;
    this.queryTargetTypeValue = QueryTargetType.Title;
    this.sortTypeValue = SortType.Timestamp;
    this.sortOrderTypeValue = SortOrderType.Desc;
    this.filtersValue = [];
    this.querySourceMaxResultValue = None;
    this.queryMaxResultValue = None;
  }

  queryType(v: unknown): IOptionStateBuilder {
    const x = toQueryType(v);
    if (x.ok) {
      this.queryTypeValue = x.value;
    } else {
      Log.info(`builder query type ${x.value} ${v}`);
    }
    return this;
  }
  queryTargetType(v: unknown): IOptionStateBuilder {
    const x = toQueryTargetType(v);
    if (x.ok) {
      this.queryTargetTypeValue = x.value;
    } else {
      Log.info(`builder query target type ${x.value} ${v}`);
    }
    return this;
  }
  sortType(v: unknown): IOptionStateBuilder {
    const x = toSortType(v);
    if (x.ok) {
      this.sortTypeValue = x.value;
    } else {
      Log.info(`builder sort type ${x.value} ${v}`);
    }
    return this;
  }
  sortOrderType(v: unknown): IOptionStateBuilder {
    const x = toSortOrderType(v);
    if (x.ok) {
      this.sortOrderTypeValue = x.value;
    } else {
      Log.info(`builder sort order type ${x.value} ${v}`);
    }
    return this;
  }
  addFilter(v: unknown): IOptionStateBuilder {
    if (v === undefined) {
      return this;
    }
    const x = toFilterType(v);
    if (x.ok) {
      this.filtersValue.push(x.value);
    } else {
      Log.info(`builder addFilter ${x.value} ${v}`);
    }
    return this;
  }
  filters(v: Array<unknown>): IOptionStateBuilder {
    this.filtersValue = []; // clear filters
    v.forEach((x) => this.addFilter(x));
    return this;
  }
  querySourceMaxResult(v: unknown): IOptionStateBuilder {
    if (v === undefined) {
      this.querySourceMaxResultValue = None;
      return this;
    }
    const x = toQuerySourceMaxResult(v);
    if (x.ok) {
      this.querySourceMaxResultValue = x.value;
    } else {
      Log.info(`builder query source max result ${x.value} ${v}`);
    }
    return this;
  }
  queryMaxResult(v: unknown): IOptionStateBuilder {
    if (v === undefined) {
      this.queryMaxResultValue = None;
      return this;
    }
    const x = toQueryMaxResult(v);
    if (x.ok) {
      this.queryMaxResultValue = x.value;
    } else {
      Log.info(`builder query max result ${x.value} ${v}`);
    }
    return this;
  }
  build(): IOptionState {
    return {
      queryType: this.queryTypeValue,
      queryTargetType: this.queryTargetTypeValue,
      sortType: this.sortTypeValue,
      sortOrderType: this.sortOrderTypeValue,
      filters: this.filtersValue,
      queryMaxResult: this.queryMaxResultValue,
      querySourceMaxResult: this.querySourceMaxResultValue,
    };
  }
  private parse(k: string, v: unknown) {
    switch (k) {
      case "queryType":
        this.queryType(v);
        break;
      case "queryTargetType":
        this.queryTargetType(v);
        break;
      case "sortType":
        this.sortType(v);
        break;
      case "sortOrderType":
        this.sortOrderType(v);
        break;
      case "filters":
        if (Array.isArray(v)) {
          this.filters(v);
        }
        break;
      case "queryMaxResult":
        this.queryMaxResult(v);
        break;
      case "querySourceMaxResult":
        this.querySourceMaxResult(v);
        break;
    }
  }
  fromObject(v: { [key: string]: unknown }): IOptionStateBuilder {
    Object.entries(v).forEach(([k, v]) => this.parse(k, v));
    return this;
  }
}
