export const QueryType = {
  Raw: "raw",
  Regex: "regex",
  Glob: "glob",
} as const;
export type QueryType = typeof QueryType[keyof typeof QueryType];

export const QueryTargetType = {
  Title: "title",
  Url: "url",
} as const;
export type QueryTargetType =
  typeof QueryTargetType[keyof typeof QueryTargetType];

export const SortType = {
  LastVisitTime: "lastVisitTime",
  VisitCount: "visitCount",
} as const;
export type SortType = typeof SortType[keyof typeof SortType];

export const StorageAreaName = {
  Sync: "sync",
  Local: "local",
  Managed: "managed",
} as const;
export type StorageAreaName =
  typeof StorageAreaName[keyof typeof StorageAreaName];

export const OptionKey = {
  SortType: "sortType",
  QueryType: "queryType",
  QueryTagetType: "queryTargetType",
  QueryStartTimeBeforeHour: "queryStartTimeBeforeHour",
  QueryMaxResult: "queryMaxResult",
  QuerySourceMaxResult: "querySourceMaxResult",
} as const;
export type OptionKey = typeof OptionKey[keyof typeof OptionKey];

/** An utility to add event listener for change of [[IOptionListState]]. */
export interface IOptionListStateEventOnChanged {
  addListener(callback: (area: StorageAreaName) => void): void;
}

/** An implementation for [[IOptionListStateEventOnChanged]]. */
export class OptionListStateEventOnChanged
  implements IOptionListStateEventOnChanged
{
  addListener(callback: (area: StorageAreaName) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      // 2 validations for change event.
      // a. event by known area name.
      // b. changed record is used for searching history.
      const optKeys = Object.values(OptionKey).map((x) => String(x));
      if (
        Object.values(StorageAreaName).includes(areaName) &&
        Object.keys(changes).some((x) => optKeys.includes(x))
      ) {
        callback(areaName as StorageAreaName);
      }
    });
  }
}

/**
 * A state represents the hgrep's configurations.
 */
export interface IOptionListState {
  /** This is a sort type of search results. */
  readonly sortType: SortType;
  /** This represents the handling of a search word. */
  readonly queryType: QueryType;
  /** This represents the search target. */
  readonly queryTargetType: QueryTargetType;
  /**
   * This represents the search time range.
   * Between now - the value hours and now.
   */
  readonly queryStartTimeBeforeHour: number;
  /** This is the max number of the search result. */
  readonly queryMaxResult: number;
  /** This is the max number of the original search result. */
  readonly querySourceMaxResult: number;
}

/** A [[IOptionListState]] jsonifier. */
export interface IOptionListStateFlattener {
  /**
   * This jsonifies [[IOptionListState]].
   * @param state State to be jsonified.
   * @return json of the state.
   */
  flatten(state: IOptionListState): { [key: string]: string };
}

/** A [[IOptionListStateFlattener]] implementation. */
export class OptionListStateFlattener implements IOptionListStateFlattener {
  flatten(state: IOptionListState): { [key: string]: string } {
    return Object.entries(state)
      .map(([k, v]) => [k, String(v)])
      .reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {} as { [key: string]: string });
  }
}

/** A [[IOptionListState]] builder. */
export interface IOptionListStateBuilder {
  /**
   * Tries to set sortType.
   * Noop if `v` is not a [[SortType]].
   */
  sortType(v: string): IOptionListStateBuilder;
  /**
   * Tries to set queryType.
   * Noop if `v` is not a [[QueryType]].
   */
  queryType(v: string): IOptionListStateBuilder;
  /**
   * Ttries to set queryTargetType.
   * Noop if `v` is not a [[QueryTargetType]].
   */
  queryTargetType(v: string): IOptionListStateBuilder;
  /**
   * Tries to set queryStartTimeBeforeHour.
   * Noop if `v` is not a positive number.
   */
  queryStartTimeBeforeHour(v: string): IOptionListStateBuilder;
  /**
   * Tries to set queryMaxResult.
   * Noop if `v` is not a positive number.
   */
  queryMaxResult(v: string): IOptionListStateBuilder;
  /**
   * Tries to set querySourceMaxResult.
   * Noop if `v` is not a positive number.
   */
  querySourceMaxResult(v: string): IOptionListStateBuilder;
  /** Builds a new [[IOptionListState]]. */
  build(): IOptionListState;
}

/**
 * A [[IOptionListStateBuilder]] implementation.
 * You can build a default [[IOptionListState]] by build without setting method invocations, like this:
 *
 * ```typescript
 * const defaultState = new OptionListStateBuilder().build();
 * ```
 */
export class OptionListStateBuilder implements IOptionListStateBuilder {
  private sortTypeValue: SortType;
  private queryTypeValue: QueryType;
  private queryTargetTypeValue: QueryTargetType;
  private queryStartTimeBeforeHourValue: number;
  private queryMaxResultValue: number;
  private querySourceMaxResultValue: number;

  constructor() {
    this.sortTypeValue = SortType.LastVisitTime;
    this.queryTypeValue = QueryType.Raw;
    this.queryTargetTypeValue = QueryTargetType.Title;
    this.queryStartTimeBeforeHourValue = 24;
    this.queryMaxResultValue = 100;
    this.querySourceMaxResultValue = 100;
  }

  sortType(v: string): IOptionListStateBuilder {
    if (Object.values(SortType).some((x) => x == v)) {
      this.sortTypeValue = v as SortType;
    }
    return this;
  }
  queryType(v: string): IOptionListStateBuilder {
    if (Object.values(QueryType).some((x) => x == v)) {
      this.queryTypeValue = v as QueryType;
    }
    return this;
  }
  queryTargetType(v: string): IOptionListStateBuilder {
    if (Object.values(QueryTargetType).some((x) => x == v)) {
      this.queryTargetTypeValue = v as QueryTargetType;
    }
    return this;
  }
  queryStartTimeBeforeHour(v: string): IOptionListStateBuilder {
    const x = Number(v);
    if (!Number.isNaN(x) && x > 0) {
      this.queryStartTimeBeforeHourValue = x;
    }
    return this;
  }
  queryMaxResult(v: string): IOptionListStateBuilder {
    const x = Number(v);
    if (!Number.isNaN(x) && x > 0) {
      this.queryMaxResultValue = x;
    }
    return this;
  }
  querySourceMaxResult(v: string): IOptionListStateBuilder {
    const x = Number(v);
    if (!Number.isNaN(x) && x > 0) {
      this.querySourceMaxResultValue = x;
    }
    return this;
  }
  build(): IOptionListState {
    return {
      sortType: this.sortTypeValue,
      queryType: this.queryTypeValue,
      queryTargetType: this.queryTargetTypeValue,
      queryStartTimeBeforeHour: this.queryStartTimeBeforeHourValue,
      queryMaxResult: this.queryMaxResultValue,
      querySourceMaxResult: this.querySourceMaxResultValue,
    };
  }
}

/** This is a chrome storage API. */
export interface IStorageArea {
  get(
    callback: (items: { [key: string]: string }) => void,
    keys?: Array<string>
  ): void;
  set(items: { [key: string]: string }): void;
}

/** A chrome local storage wrapper. */
export class LocalStorageArea implements IStorageArea {
  get(
    callback: (items: { [key: string]: string }) => void,
    keys?: Array<string>
  ): void {
    chrome.storage.local.get(keys, callback);
  }
  set(items: { [key: string]: string }): void {
    chrome.storage.local.set(items);
  }
}

/** This is an interface of manipulating [[IOptionListState]] with persistence. */
export interface IOptionListStateStorage {
  /**
   * Reads [[IOptionListState]] from the storage.
   * @param callback function to receive the state.
   */
  read(callback: (state: IOptionListState) => void): void;
  /**
   * Writes [[IoptionListState]] into the storage.
   * @param state state to save.
   */
  write(state: IOptionListState): void;
  /**
   * Updates [[IOptionListState]] to the storage.
   * Update the state records with a key in the keys.
   * @param state state to save.
   * @param keys keys of the state records to update.
   */
  update(state: IOptionListState, keys: Array<OptionKey>): void;
}

/** A [[IOptionListStateStorage]] implementation. */
export class OptionListStateStorage implements IOptionListStateStorage {
  constructor(
    private newBuilder: () => IOptionListStateBuilder,
    private newFlattener: () => IOptionListStateFlattener,
    private storageArea: IStorageArea
  ) {}

  update(state: IOptionListState, keys: Array<OptionKey>): void {
    const f = this.newFlattener();
    const skeys = keys.map((x) => String(x));
    const s = f.flatten(state);
    this.read((old) => {
      const t = f.flatten(old);
      Object.entries(s)
        .filter(([k, _]) => skeys.includes(k))
        .forEach(([k, v]) => {
          t[k] = v;
        });
      const next = this.buildFromFlatMap(t);
      this.write(next);
    });
  }

  private buildFromFlatMap(s: { [key: string]: any }): IOptionListState {
    const b = this.newBuilder();
    Object.entries(s)
      .filter(([_, v]) => typeof v === "string")
      .forEach(([k, u]) => {
        const v = String(u);
        switch (k) {
          case "sortType":
            b.sortType(v);
            break;
          case "queryType":
            b.queryType(v);
            break;
          case "queryTargetType":
            b.queryTargetType(v);
            break;
          case "queryStartTimeBeforeHour":
            b.queryStartTimeBeforeHour(v);
            break;
          case "queryMaxResult":
            b.queryMaxResult(v);
            break;
          case "querySourceMaxResult":
            b.querySourceMaxResult(v);
            break;
        }
      });
    return b.build();
  }

  read(callback: (state: IOptionListState) => void): void {
    const f = (result) => callback(this.buildFromFlatMap(result));
    const keys = Object.values(OptionKey).map((x) => String(x));
    this.storageArea.get(f, keys);
  }

  write(state: IOptionListState): void {
    const f = this.newFlattener();
    this.storageArea.set(f.flatten(state));
  }
}
