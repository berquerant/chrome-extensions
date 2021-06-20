import * as Common from "./Common";
import * as Native from "./Native";

/** A bookmark scanner. */
export interface IScanner {
  /** Scan all bookmarks. */
  scan(): Promise<Common.INodeMap>;
}

export function newIScanner(api: Native.IBookmarksAPI): IScanner {
  return new Scanner(api);
}

class Scanner implements IScanner {
  constructor(private api: Native.IBookmarksAPI) {}

  async scan(): Promise<Common.INodeMap> {
    return this.api.getTree().then((roots) => {
      const d = Common.newINodeMap();
      roots.forEach((x) =>
        this.traverse(x, (n: Native.INode) => {
          const t = {
            id: n.id,
            parentId: n.parentId,
            info: {
              url: n.url,
              title: n.title,
              dateAdded: n.dateAdded,
            },
          };
          d.set(t);
        })
      );
      return d;
    });
  }
  private traverse(n: Native.INode, callback: (n: Native.INode) => void): void {
    callback(n);
    if (!n.children) {
      return;
    }
    n.children.forEach((x) => this.traverse(x, callback));
  }
}
