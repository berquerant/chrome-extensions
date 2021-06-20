/** A partial structure of chrome.bookmarks.BookmarkTreeNode. */
export interface INode {
  children?: Array<INode>;
  dateAdded?: number;
  id: string;
  parentId?: string;
  url?: string;
  title: string;
}

/** A wrapper of chrome.bookmarks API. */
export interface IBookmarksAPI {
  getTree(): Promise<Array<INode>>;
  remove(id: string): Promise<void>;
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
}
