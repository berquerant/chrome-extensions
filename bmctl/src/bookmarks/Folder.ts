import * as Common from "@/bookmarks/Common";
import * as Read from "@/bookmarks/Read";
import * as Func from "@/common/Function";
import { IFuzzySearcher } from "@/common/Search";

export interface IQuery {
  /** Search word. */
  readonly word: string;
}

/** Provides an interface for searching bookmark folders. */
export interface ISearcher {
  search(query: IQuery): Promise<Common.INodeList>;
}

export function newISearcher(
  scanner: Read.IScanner,
  fuzzySearcherFactory: (keys: Array<string>) => IFuzzySearcher
): ISearcher {
  return new Searcher(scanner, fuzzySearcherFactory);
}

type IFolderListSelector = Func.Mapper<Common.INodeList, Common.INodeList>;

class Searcher implements ISearcher {
  constructor(
    private scanner: Read.IScanner,
    private fuzzySearcherFactory: (keys: Array<string>) => IFuzzySearcher
  ) {}

  async search(query: IQuery): Promise<Common.INodeList> {
    const selector = this.selector(query.word);
    return this.scanner
      .scan()
      .then((r) => selector(Array.from(this.folders(r))).sort(this.compare));
  }

  private *folders(nodeMap: Common.INodeMap): IterableIterator<Common.INode> {
    for (const n of nodeMap.values()) {
      if (this.isFolder(n)) yield n;
    }
  }

  private selector(word: string): IFolderListSelector {
    const fs = this.fuzzySearcherFactory(["info.path.str"]);
    return (list: Common.INodeList): Common.INodeList => fs.search(list, word);
  }

  private compare(a: Common.INode, b: Common.INode): number {
    return Func.stringComparer(a.info.path.str, b.info.path.str);
  }

  private isFolder(n: Common.INode): boolean {
    return n.info.url === undefined;
  }
}
