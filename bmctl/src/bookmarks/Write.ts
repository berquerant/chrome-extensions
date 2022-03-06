import * as Common from "@/bookmarks/Common";
import * as Native from "@/bookmarks/Native";

/** A bookmark remover. */
export interface IRemover {
  /** Delete a bookmark. */
  remove(id: Common.NodeId): Promise<void>;
}

export function newIRemover(api: Native.IBookmarksAPI): IRemover {
  return new Remover(api);
}

class Remover implements IRemover {
  constructor(private api: Native.IBookmarksAPI) {}

  async remove(id: Common.NodeId): Promise<void> {
    this.api.remove(id);
  }
}

/** A bookmark creator. */
export interface ICreator {
  /** Create a bookmark. */
  create(node: Common.ICreateNode): Promise<Common.INode>;
}

export function newICreator(api: Native.IBookmarksAPI): ICreator {
  return new Creator(api);
}

class Creator implements ICreator {
  constructor(private api: Native.IBookmarksAPI) {}

  async create(node: Common.ICreateNode): Promise<Common.INode> {
    return this.api.create(node).then((x) => {
      return {
        id: x.id,
        parentId: x.parentId,
        info: {
          url: x.url,
          title: x.title,
          dateAdded: x.dateAdded,
        },
      };
    });
  }
}
