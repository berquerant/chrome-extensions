export interface ISet<T> {
  add(value: T): void;
  delete(value: T): void;
  clear(): void;
  has(value: T): boolean;
  size(): number;
  values(): Iterator<T> & Iterable<T>;
  clone(): ISet<T>;
}

export function newISet<T>(): ISet<T> {
  return new SetImpl<T>();
}

class SetImpl<T> implements ISet<T> {
  private s: Set<T>;
  constructor() {
    this.s = new Set<T>();
  }
  add(value: T): void {
    this.s.add(value);
  }
  delete(value: T): void {
    this.s.delete(value);
  }
  clear(): void {
    this.s.clear();
  }
  has(value: T): boolean {
    return this.s.has(value);
  }
  size(): number {
    return this.s.size;
  }
  values(): Iterator<T> & Iterable<T> {
    return this.s.values();
  }
  clone(): ISet<T> {
    const s = new SetImpl<T>();
    Array.from(this.s.values()).forEach((x) => {
      s.add(x);
    });
    return s;
  }
}
