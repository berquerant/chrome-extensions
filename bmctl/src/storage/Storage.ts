/** A chrome storage API. */
export interface IStorageArea {
  get(keys?: Array<string>): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

export function newLocalStorageArea(): IStorageArea {
  return new LocalStorageArea();
}

/** A chrome local storage wrapper. */
class LocalStorageArea implements IStorageArea {
  async get(keys?: Array<string>): Promise<Record<string, unknown>> {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  }
  async set(items: Record<string, unknown>): Promise<void> {
    return chrome.storage.local.set(items);
  }
}

/** A partial chrome storage event listener. */
export interface IStorageAreaListener {
  add(callback: () => void): void;
}

export function newIStorageAreaListener(): IStorageAreaListener {
  return new StorageAreaListener();
}

class StorageAreaListener {
  add(callback: (keys: Array<string>) => void): void {
    chrome.storage.onChanged.addListener((changes, _) => {
      callback(Object.keys(changes));
    });
  }
}
