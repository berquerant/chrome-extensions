import * as Common from "@/bookmarks/Common";
import * as Read from "@/bookmarks/Read";
import * as Func from "@/common/Function";
import { IFuzzySearcher } from "@/common/Search";

export interface IQuery {
  /** Search word. */
  readonly word: string;
}

export interface INode extends Common.INode {
  absPath: string;
}

export function newINode(node: Common.INode): INode {
  const path = node.info.path;
  const strPath = path === undefined ? "" : path.join("/");
  return {
    ...node,
    absPath: "/" + strPath,
  };
}

export type INodeList = Array<INode>;

/** Provides an interface for searching bookmark folders. */
export interface ISearcher {
  search(query: IQuery): Promise<INodeList>;
}

export function newISearcher(
  scanner: Read.IScanner,
  fuzzySearcherFactory: (keys: Array<string>) => IFuzzySearcher
): ISearcher {
  return new Searcher(scanner, fuzzySearcherFactory);
}

type IFolderListSelector = Func.Mapper<INodeList, INodeList>;

class Searcher implements ISearcher {
  constructor(
    private scanner: Read.IScanner,
    private fuzzySearcherFactory: (keys: Array<string>) => IFuzzySearcher
  ) {}

  async search(query: IQuery): Promise<INodeList> {
    const selector = this.selector(query.word);
    return this.scanner.scan().then((r) => {
      const src = Array.from(this.folders(r)).map(newINode);
      return selector(src).sort(this.compare);
    });
  }

  private *folders(nodeMap: Common.INodeMap): IterableIterator<Common.INode> {
    for (const n of nodeMap.values()) {
      if (this.isFolder(n)) yield n;
    }
  }

  private selector(word: string): IFolderListSelector {
    const fs = this.fuzzySearcherFactory(["absPath"]);
    return (list: INodeList): INodeList => fs.search(list, word);
  }

  private compare(a: INode, b: INode): number {
    return Func.stringComparer(a.absPath, b.absPath);
  }

  private isFolder(n: Common.INode): boolean {
    return n.info.url === undefined;
  }
}
