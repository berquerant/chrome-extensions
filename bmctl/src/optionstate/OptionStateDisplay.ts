import * as State from "../state/State";
import * as Time from "../common/Time";
import * as Err from "../common/Err";

class GetError extends Err.BaseError {}
class SetError extends Err.BaseError {}

/** A kind of settings. */
export const OptionTag = {
  queryType: "query-type",
  queryTargetType: "query-target-type",
  sortType: "sort-type",
  sortOrderType: "sort-order-type",
  filterAfter: "filter-after",
  filterBefore: "filter-before",
  querySourceMaxResult: "query-source-max-result",
  queryMaxResult: "query-max-result",
  saveButton: "save-options",
  resetButton: "reset-options",
} as const;
export type OptionTag = typeof OptionTag[keyof typeof OptionTag];

/** Manage the display of option settings. */
export interface IOptionStateDisplayManager {
  /** Reflect the option settings on the screen. */
  write(state: State.IOptionState, tags: Array<OptionTag>): void;
  /** Read the option settings on the screen.  */
  read(tags: Array<OptionTag>): State.IOptionState;
}

export function newIOptionStateDisplayManager(
  newBuilder: () => State.IOptionStateBuilder
): IOptionStateDisplayManager {
  return new OptionStateDisplayManager(newBuilder);
}

class OptionStateDisplayManager implements IOptionStateDisplayManager {
  constructor(private newBuilder: () => State.IOptionStateBuilder) {}

  read(tags: Array<OptionTag>): State.IOptionState {
    const b = this.newBuilder();
    const filters = [];
    tags.forEach((t) => {
      const v = this.getOptionAsString(t);
      switch (t) {
        case OptionTag.queryType:
          b.queryType(v);
          break;
        case OptionTag.queryTargetType:
          b.queryTargetType(v);
          break;
        case OptionTag.sortType:
          b.sortType(v);
          break;
        case OptionTag.sortOrderType:
          b.sortOrderType(v);
          break;
        case OptionTag.filterAfter: {
          const ts = Time.timestringToDate(v);
          if (ts.ok) {
            filters.push({
              kind: "after",
              timestamp: Math.floor(ts.value.getTime() / 1000),
            });
          }
          break;
        }
        case OptionTag.filterBefore: {
          const ts = Time.timestringToDate(v);
          if (ts.ok) {
            filters.push({
              kind: "before",
              timestamp: Math.floor(ts.value.getTime() / 1000),
            });
          }
          break;
        }
        case OptionTag.querySourceMaxResult:
          b.querySourceMaxResult(v === "" ? undefined : v);
          break;
        case OptionTag.queryMaxResult:
          b.queryMaxResult(v === "" ? undefined : v);
          break;
      }
    });
    b.filters(filters);
    return b.build();
  }
  write(s: State.IOptionState, tags: Array<OptionTag>): void {
    tags.forEach((t) => {
      switch (t) {
        case OptionTag.queryType:
          this.setOptionValue(t, s.queryType);
          break;
        case OptionTag.queryTargetType:
          this.setOptionValue(t, s.queryTargetType);
          break;
        case OptionTag.sortType:
          this.setOptionValue(t, s.sortType);
          break;
        case OptionTag.sortOrderType:
          this.setOptionValue(t, s.sortOrderType);
          break;
        case OptionTag.queryMaxResult:
          this.setOptionValue(t, s.queryMaxResult);
          break;
        case OptionTag.querySourceMaxResult:
          this.setOptionValue(t, s.querySourceMaxResult);
          break;
        case OptionTag.filterAfter:
        case OptionTag.filterBefore:
          {
            const kind = t == OptionTag.filterAfter ? "after" : "before";
            const xs = s.filters.filter((x) => x.kind == kind);
            if (xs.length == 0) {
              this.setOptionValue(t, "");
              break;
            }
            xs.forEach((x) => {
              this.setOptionValue(
                t,
                Time.dateToTimestring(new Date(x.timestamp * 1000))
              );
            });
          }
          break;
      }
    });
  }

  /* Utilities to get option. */

  private getOptionAsString(tag: OptionTag): string {
    switch (tag) {
      case OptionTag.queryType:
      case OptionTag.queryTargetType:
      case OptionTag.sortType:
      case OptionTag.sortOrderType:
        return this.getSelectElementValue(tag);
      case OptionTag.queryMaxResult:
      case OptionTag.querySourceMaxResult:
      case OptionTag.filterAfter:
      case OptionTag.filterBefore:
        return this.getInputElementValue(tag);
    }
    throw new GetError(`OptionTag: ${tag}`);
  }
  private getSelectElementValue(id: string): string {
    return (document.getElementById(id) as HTMLSelectElement).value;
  }
  private getInputElementValue(id: string): string {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  /* Utilities to set option. */

  private setOptionValue<T>(tag: OptionTag, value: T) {
    const v = value === undefined ? "" : String(value);
    switch (tag) {
      case OptionTag.queryType:
      case OptionTag.queryTargetType:
      case OptionTag.sortType:
      case OptionTag.sortOrderType:
        this.setSelectElementValue(tag, v);
        return;
      case OptionTag.queryMaxResult:
      case OptionTag.querySourceMaxResult:
        // a sort of partial type check (Option<number>)
        if (typeof value == "object" && value != null && "ok" in value) {
          if (!value["ok"]) {
            this.setInputElementValue(tag, "");
            return;
          }
          this.setInputElementValue(tag, value["value"]);
        }
        return;
      case OptionTag.filterAfter:
      case OptionTag.filterBefore:
        this.setInputElementValue(tag, v);
        return;
    }
    throw new SetError(`OptionTag: ${tag} ${String(value)}`);
  }
  private setSelectElementValue<T>(id: string, value: T) {
    (document.getElementById(id) as HTMLSelectElement).value = String(value);
  }
  private setInputElementValue<T>(id: string, value: T) {
    (document.getElementById(id) as HTMLInputElement).value = String(value);
  }
}
