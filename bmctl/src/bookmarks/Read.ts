import * as Common from "@/bookmarks/Common";
import * as Native from "@/bookmarks/Native";
import { Some, None } from "@/common/Function";

/** A bookmark getter. */
export interface IGetter {
  /**
   * Get bookmarks.
   * @param ids target bookmark ids
   * @return found bookmarks
   **/
  get(ids: Array<string>): Promise<Common.INodeMap>;
}

export function newIGetter(api: Native.IBookmarksAPI): IGetter {
  return new Getter(api);
}

class Getter implements IGetter {
  constructor(private api: Native.IBookmarksAPI) {}
  async get(ids: Array<string>): Promise<Common.INodeMap> {
    const d = Common.newINodeMap();
    for (const id of ids) {
      const r = await this.api
        .get([id])
        .then((x) => Some(x[0]))
        .catch((_) => None);
      if (r.ok) {
        const v = r.value;
        d.set({
          id: v.id,
          parentId: v.parentId,
          info: {
            url: v.url,
            title: v.title,
            dateAdded: v.dateAdded,
          },
        });
      }
    }
    return d;
  }
}

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
