import * as State from "../common/State";
import * as Err from "../common/Error";
import * as Search from "../common/Search";
import Fuse from "fuse.js";

export class RegExpSyntaxError extends Err.BaseError {}

/** Provides an interface for searching the history of visited pages. */
export interface ISearcher {
  search(word: string, callback: (result: Search.ISearchResult) => void): void;
}
/**
 * A compare function.
 * Returns positive number if left > right.
 * Returns negative number if left < right.
 * Returns zero if left = right.
 */
type IResultItemComparer = (
  a: Search.ISearchResultItem,
  b: Search.ISearchResultItem
) => number;
/** A predicate to select item. */
type IResultItemMatcher = (a: Search.ISearchResultItem) => boolean;
/** A index extractor for string matching. */
type IResultItemStringPicker = (a: Search.ISearchResultItem) => string;
type IResultItemsSelector = (
  items: ReadonlyArray<Search.ISearchResultItem>
) => ReadonlyArray<Search.ISearchResultItem>;

export class Searcher implements ISearcher {
  constructor(
    private history: Search.IHistorySearcher,
    private config: State.IOptionListState
  ) {}

  search(word: string, callback: (result: Search.ISearchResult) => void): void {
    const startTime =
      Date.now() - this.config.queryStartTimeBeforeHour * 60 * 60 * 1000; // timestamp(ms)
    const selector = this.selectResultItems(word);
    this.history.search(
      {
        text: "", // retrieve all pages
        maxResults: this.config.querySourceMaxResult, // limit data source size
        startTime: startTime, // limit search time range
      },
      (result) => {
        const items = selector(result.items).slice(
          0,
          this.config.queryMaxResult
        ); // limit number of results
        callback({
          items: items,
        });
      }
    );
  }

  private selectResultItems(word: string): IResultItemsSelector {
    if (this.config.queryType === State.QueryType.Fuzzy) {
      return this.matchFuzzy(word);
    }
    const comparer = this.compareResultItem();
    const matcher = this.matchResultItem(word);
    return (items: ReadonlyArray<Search.ISearchResultItem>) =>
      items
        .filter((x) => x.url && matcher(x)) // url must exist
        .sort(comparer);
  }

  private matchFuzzy(word: string): IResultItemsSelector {
    const comparer = this.compareResultItem();
    if (word === "") {
      return (items: ReadonlyArray<Search.ISearchResultItem>) =>
        Array.from(items).sort(comparer);
    }
    return (items: ReadonlyArray<Search.ISearchResultItem>) =>
      new Fuse(items, {
        keys: ["title", "url"],
        useExtendedSearch: true,
        shouldSort: false,
      })
        .search(word)
        .map((x) => x.item)
        .sort(comparer);
  }

  private matchResultItem(word: string): IResultItemMatcher {
    const extractor = this.matchInfoExtractor();
    const g =
      (matcher: (s: string) => boolean) => (item: Search.ISearchResultItem) =>
        matcher(extractor(item));
    switch (this.config.queryType) {
      case State.QueryType.Raw:
        return g((s) => s.indexOf(word) >= 0);
      case State.QueryType.Regex:
        try {
          const rWord = new RegExp(word);
          return g((s) => rWord.test(s));
        } catch (e) {
          throw new RegExpSyntaxError(e);
        }
      case State.QueryType.Glob:
        throw new Err.NotImplementedError(
          "QueryType Glob is not implemented yet"
        );
      default:
        throw new Err.UnknownError(
          `Unknown QueryType: ${this.config.queryType}`
        );
    }
  }

  private matchInfoExtractor(): IResultItemStringPicker {
    switch (this.config.queryTargetType) {
      case State.QueryTargetType.Title:
        return (a) => (a.title ? a.title : "");
      case State.QueryTargetType.Url:
        return (a) => a.url;
      default:
        throw new Err.UnknownError(
          `Unknown QueryTargetType: ${this.config.queryTargetType}`
        );
    }
  }

  private compareResultItem(): IResultItemComparer {
    switch (this.config.sortType) {
      case State.SortType.LastVisitTime:
        return (a, b) => {
          const aUndef = a.lastVisitTime === undefined;
          const bUndef = b.lastVisitTime === undefined;
          if (aUndef !== bUndef) {
            return aUndef ? 1 : -1;
          }
          if (!aUndef) {
            // time desc
            return b.lastVisitTime - a.lastVisitTime;
          }
          return 0;
        };
      case State.SortType.VisitCount:
        return (a, b) => {
          const aUndef = a.visitCount === undefined;
          const bUndef = b.visitCount === undefined;
          if (aUndef !== bUndef) {
            return aUndef ? 1 : -1;
          }
          if (!aUndef) {
            // count desc
            return b.visitCount - a.visitCount;
          }
          return 0;
        };
      default:
        throw new Err.UnknownError(`Unknown SortType: ${this.config.sortType}`);
    }
  }
}
