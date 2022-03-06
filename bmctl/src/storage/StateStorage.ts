import * as State from "@/state/State";
import * as Storage from "@/storage/Storage";

/** [[IOptionState]] manipulator. */
export interface IOptionStateStorage {
  /** Read state from storage. */
  read(): Promise<State.IOptionState>;
  /** Write state into storage. */
  write(state: State.IOptionState): Promise<void>;
  /** Update state. Select attributes to update by keys. */
  update(
    state: State.IOptionState,
    keys: ReadonlyArray<State.OptionStateKey>
  ): Promise<void>;
}

export function newIOptionStateStorage(
  storage: Storage.IStorageArea,
  newBuilder: () => State.IOptionStateBuilder
): IOptionStateStorage {
  return new OptionStateStorage(storage, newBuilder);
}

class OptionStateStorage implements IOptionStateStorage {
  constructor(
    private storage: Storage.IStorageArea,
    private newBuilder: () => State.IOptionStateBuilder
  ) {}
  async read(): Promise<State.IOptionState> {
    return this.storage
      .get(Object.values(State.OptionStateKey))
      .then((items) => this.newBuilder().fromObject(items).build());
  }
  async write(state: State.IOptionState): Promise<void> {
    return this.storage.set(state as any);
  }
  async update(
    state: State.IOptionState,
    keys: ReadonlyArray<State.OptionStateKey>
  ): Promise<void> {
    const skeys = keys.map((x) => String(x));
    return this.read().then(async (old) => {
      const t = JSON.parse(JSON.stringify(old));
      skeys
        .map((k) => [k, state[k]]) // treat unset key as undefined
        .forEach(([k, v]) => {
          t[k] = v;
        });
      const r = this.newBuilder().fromObject(t).build();
      await this.write(r);
    });
  }
}
