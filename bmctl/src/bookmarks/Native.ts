/** A partial structure of chrome.bookmarks.BookmarkTreeNode. */
export interface INode {
  children?: Array<INode>;
  dateAdded?: number;
  id: string;
  parentId?: string;
  url?: string;
  title: string;
}

/** A partial structure of chrome.bookmarks.CreateDetails. */
export interface ICreateNode {
  parentId?: string;
  title?: string;
  /** For folder if undefined. */
  url?: string;
}

/** A wrapper of chrome.bookmarks API. */
export interface IBookmarksAPI {
  getTree(): Promise<Array<INode>>;
  remove(id: string): Promise<void>;
  get(ids: Array<string>): Promise<Array<INode>>;
  create(node: ICreateNode): Promise<INode>;
}

export function newIBookmarksAPI(): IBookmarksAPI {
  return new BookmarksAPI();
}

class BookmarksAPI implements IBookmarksAPI {
  async getTree(): Promise<Array<INode>> {
    return chrome.bookmarks.getTree();
  }
  async remove(id: string): Promise<void> {
    chrome.bookmarks.remove(id);
  }
  async get(ids: Array<string>): Promise<Array<INode>> {
    return chrome.bookmarks.get(ids);
  }
  async create(node: ICreateNode): Promise<INode> {
    return chrome.bookmarks.create(node);
  }
}
