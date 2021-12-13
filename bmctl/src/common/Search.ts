import Fuse from "fuse.js";

/** Provides an interface for fuzzy searching. */
export interface IFuzzySearcher {
  /**
   * Search the `list` by `pattern`, returns the matched elements.
   *
   * # Example:
   * ```typescript
   * type Document = {
   *   title: string;
   *   content: string;
   * };
   * const s = newIFuzzySearcher(["title"]);
   * const docs: Array<Document> = // ...
   * s.search(docs, "grain");
   * ```
   */
  search<T>(list: Array<T>, pattern: string): Array<T>;
}

class FuzzySearcher implements IFuzzySearcher {
  constructor(private keys: Array<string>) {}

  search<T>(list: Array<T>, pattern: string): Array<T> {
    if (this.keys.length === 0 || pattern === "") {
      return list;
    }
    return new Fuse(list, {
      keys: this.keys,
      shouldSort: false,
      useExtendedSearch: true,
    })
      .search(pattern)
      .map((x) => x.item);
  }
}

/**
 * Returns a new `IFuzzySearcher`.
 * @param keys List of the paths that will be searched.
 */
export const newIFuzzySearcher = (keys: Array<string>): IFuzzySearcher =>
  new FuzzySearcher(keys);
