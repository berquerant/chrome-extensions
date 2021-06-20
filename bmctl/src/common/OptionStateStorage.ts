import * as State from "../state/State";
import * as StateStorage from "../storage/StateStorage";
import { OptionTag, IOptionStateDisplayManager } from "./OptionStateDisplay";
import * as Err from "./Err";

class UnknownTagError extends Err.UnknownError {}

function tagToKey(t: OptionTag): State.OptionStateKey {
  switch (t) {
    case OptionTag.queryType:
      return State.OptionStateKey.QueryType;
    case OptionTag.queryTargetType:
      return State.OptionStateKey.QueryTargetType;
    case OptionTag.sortType:
      return State.OptionStateKey.SortType;
    case OptionTag.sortOrderType:
      return State.OptionStateKey.SortOrderType;
    case OptionTag.queryMaxResult:
      return State.OptionStateKey.QueryMaxResult;
    case OptionTag.querySourceMaxResult:
      return State.OptionStateKey.QuerySourceMaxResult;
    case OptionTag.filterAfter:
    case OptionTag.filterBefore:
      return State.OptionStateKey.Filters;
  }
  throw new UnknownTagError(`OptionTag: ${t}`);
}

/** Manage option settings persistence. */
export interface IOptionStateManager {
  /** Write the state from DOM into the storage. */
  write(tags: Array<OptionTag>): Promise<void>;
  /** Read the state from the storage and set to DOM. */
  read(tags: Array<OptionTag>): Promise<void>;
}

export function newIOptionStateManager(
  store: StateStorage.IOptionStateStorage,
  display: IOptionStateDisplayManager
): IOptionStateManager {
  return new OptionStateManager(store, display);
}

class OptionStateManager implements IOptionStateManager {
  constructor(
    private store: StateStorage.IOptionStateStorage,
    private display: IOptionStateDisplayManager
  ) {}
  async read(tags: Array<OptionTag>): Promise<void> {
    this.store.read().then((s) => this.display.write(s, tags));
  }
  async write(tags: Array<OptionTag>): Promise<void> {
    const s = this.display.read(tags);
    this.store.update(s, tags.map(tagToKey));
  }
}
