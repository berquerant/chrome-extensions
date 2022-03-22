import * as Func from "@/common/Function";
import * as Common from "@/bookmarks/Common";
import * as Read from "@/bookmarks/Read";
import * as Err from "@/bookmarks/Err";
import { IFuzzySearcher } from "@/common/Search";

export const QueryType = {
  Raw: "raw",
  Regex: "regex",
  Fuzzy: "fuzzy",
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
    }
  | {
      kind: "folder";
      path: string;
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

export function newISearcher(
  scanner: Read.IScanner,
  fuzzySearcher: IFuzzySearcher
): ISearcher {
  return new Searcher(scanner, fuzzySearcher);
}

type StringMatcher = Func.Predicate<string>;
type INodeStringer = Func.Mapper<Common.INode, string>;
type INodePredicate = Func.Predicate<Common.INode>;
type INodeComparer = Func.UndefComparer<Common.INode>;
type INodeListSelector = Func.Mapper<Common.INodeList, Common.INodeList>;

class Searcher implements ISearcher {
  constructor(
    private scanner: Read.IScanner,
    private fuzzySearcher: IFuzzySearcher
  ) {}

  async search(query: IQuery): Promise<Common.INodeList> {
    const comparer = this.comparer(query.sortType, query.sortOrderType);
    const filterp = this.filtersToPredicate(query.filters);
    const selector = this.selector(
      query.word,
      query.queryType,
      query.queryTargetType
    );
    return this.scanner.scan().then((r) => {
      const src = Array.from(r.values())
        .slice(0, query.querySourceMaxResult)
        .filter((x) => filterp(x));
      return selector(src).sort(comparer).slice(0, query.queryMaxResult);
    });
  }
  private selector(
    word: string,
    queryType: QueryType,
    queryTargetType: QueryTargetType
  ): INodeListSelector {
    if (queryType === QueryType.Fuzzy) {
      return (list: Common.INodeList): Common.INodeList =>
        this.fuzzySearcher.search(list, word);
    }
    const matcher = this.matcher(word, queryType, queryTargetType);
    return (list: Common.INodeList): Common.INodeList =>
      list.filter((x) => matcher(x));
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
    // treat undefined as a minimal value
    const beforep =
      (ts: number): INodePredicate =>
      (a: Common.INode) =>
        a.info.dateAdded === undefined || a.info.dateAdded < ts * 1000; // to millisec
    switch (filter.kind) {
      case "before":
        return beforep(filter.timestamp);
      case "after":
        // after is exclusive
        // but ok, target is timestamp
        return (a: Common.INode) => !beforep(filter.timestamp)(a);
      case "folder":
        return (a: Common.INode) => a.info.path.str.includes(filter.path);
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
