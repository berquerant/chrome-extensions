import * as Common from "./Common";
import * as Native from "./Native";

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
