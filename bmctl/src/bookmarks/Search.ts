import * as Func from "../common/Function";
import * as Common from "./Common";
import * as Read from "./Read";
import * as Err from "./Err";

export const QueryType = {
  Raw: "raw",
  Regex: "regex",
};
export type QueryType = typeof QueryType[keyof typeof QueryType];

export const QueryTargetType = {
  Title: "title",
  Url: "url",
};
export type QueryTargetType =
  typeof QueryTargetType[keyof typeof QueryTargetType];

export const SortOrderType = {
  Asc: "asc",
  Desc: "desc",
};
export type SortOrderType = typeof SortOrderType[keyof typeof SortOrderType];

export const SortType = {
  Title: "title",
  Url: "url",
  Timestamp: "timestamp",
};
export type SortType = typeof SortType[keyof typeof SortType];

export type FilterType =
  | {
      kind: "before";
      timestamp: number;
    }
  | {
      kind: "after";
      timestamp: number;
    };

/** Search configurations. */
export interface IQuery {
  /** Search word. */
  readonly word: string;
  /** Handling of the search word. */
  readonly queryType: QueryType;
  /** Search target. */
  readonly queryTargetType: QueryTargetType;
  /** Sort type of the search result. */
  readonly sortType: SortType;
  /** Sort order of the search result. */
  readonly sortOrderType: SortOrderType;
  /** Additional filters of the search result. */
  readonly filters: ReadonlyArray<FilterType>;
  /** Max number of the search target. */
  readonly querySourceMaxResult?: number;
  /** Max number of the search results. */
  readonly queryMaxResult?: number;
}

/** Provides an interface for searching bookmarks. */
export interface ISearcher {
  search(query: IQuery): Promise<Common.INodeList>;
}

export function newISearcher(scanner: Read.IScanner): ISearcher {
  return new Searcher(scanner);
}

type StringMatcher = Func.Predicate<string>;
type INodeStringer = Func.Mapper<Common.INode, string>;
type INodePredicate = Func.Predicate<Common.INode>;
type INodeComparer = Func.UndefComparer<Common.INode>;

class Searcher implements ISearcher {
  constructor(private scanner: Read.IScanner) {}

  async search(query: IQuery): Promise<Common.INodeList> {
    const matcher = this.matcher(
      query.word,
      query.queryType,
      query.queryTargetType
    );
    const comparer = this.comparer(query.sortType, query.sortOrderType);
    const filterp = this.filtersToPredicate(query.filters);
    return this.scanner.scan().then((r) => {
      return Array.from(r.values())
        .slice(0, query.querySourceMaxResult)
        .filter((x) => matcher(x) && filterp(x))
        .sort(comparer)
        .slice(0, query.queryMaxResult);
    });
  }
  private filtersToPredicate(
    filters?: ReadonlyArray<FilterType>
  ): INodePredicate {
    if (filters === undefined || filters.length === 0) {
      return Func.tautology;
    }
    const fs = filters.map((f) => this.filterToPredicate(f));
    return (a: Common.INode) => fs.every((f) => f(a));
  }
  private filterToPredicate(filter: FilterType): INodePredicate {
    const t = filter.timestamp * 1000; // to millisec
    // treat undefined as a minimal value
    const pBefore = (a: Common.INode) =>
      a.info.dateAdded === undefined || a.info.dateAdded < t;
    switch (filter.kind) {
      case "before":
        return pBefore;
      case "after":
        // after is exclusive
        // but ok, target is timestamp
        return (a: Common.INode) => !pBefore(a);
      default:
        throw new Err.UnreachableError(`unknown filter ${filter}`);
    }
  }
  private matcher(
    word: string,
    queryType: QueryType,
    queryTargetType: QueryTargetType
  ): INodePredicate {
    const sMatcher = this.stringMatcher(word, queryType);
    const stringer = this.stringer(queryTargetType);
    return (a: Common.INode) => sMatcher(stringer(a));
  }
  private stringMatcher(word: string, queryType: QueryType): StringMatcher {
    switch (queryType) {
      case QueryType.Raw:
        return (a: string) => a.indexOf(word) >= 0;
      case QueryType.Regex:
        try {
          const r = new RegExp(word);
          return (a: string) => r.test(a);
        } catch (e) {
          throw new Err.RegExpError(e);
        }
      default:
        throw new Err.UnreachableError(`unknown query type ${queryType}`);
    }
  }
  private stringer(queryTargetType: QueryTargetType): INodeStringer {
    switch (queryTargetType) {
      case QueryTargetType.Title:
        return (a: Common.INode) => a.info.title;
      case QueryTargetType.Url:
        return (a: Common.INode) => (a.info.url ? a.info.url : "");
      default:
        throw new Err.UnreachableError(
          `unknown query target type ${queryTargetType}`
        );
    }
  }
  private comparer(
    sortType: SortType,
    sortOrderType: SortOrderType
  ): INodeComparer {
    return this.reverseComparer(sortOrderType, this.rawComparer(sortType));
  }
  private rawComparer(sortType: SortType): INodeComparer {
    switch (sortType) {
      case SortType.Title: {
        return (a: Common.INode, b: Common.INode) =>
          Func.stringComparer(a.info.title, b.info.title);
      }
      case SortType.Url: {
        const c = Func.expandComparer(Func.stringComparer);
        return (a: Common.INode, b: Common.INode) => c(a.info.url, b.info.url);
      }
      case SortType.Timestamp: {
        const c = Func.expandComparer(Func.numberComparer);
        return (a: Common.INode, b: Common.INode) =>
          c(a.info.dateAdded, b.info.dateAdded);
      }
      default:
        throw new Err.UnreachableError(`unknown sort type ${sortType}`);
    }
  }
  private reverseComparer(
    sortOrderType: SortOrderType,
    f: INodeComparer
  ): INodeComparer {
    switch (sortOrderType) {
      case SortOrderType.Asc:
        return f;
      case SortOrderType.Desc:
        return Func.reverseComparer(f);
      default:
        throw new Err.UnreachableError(
          `unknown sort order type ${sortOrderType}`
        );
    }
  }
}
