export interface ISearchParameter {
  text: string;
  maxResults?: number;
  startTime?: number;
  endTime?: number;
}

export interface ISearchResultItem {
  readonly id: string;
  readonly lastVisitTime?: number;
  readonly title?: string;
  readonly typedCount?: number;
  readonly url?: string;
  readonly visitCount?: number;
}

export interface ISearchResult {
  readonly items: ReadonlyArray<ISearchResultItem>;
}

/** A partial wrapper of chrome history API. */
export interface IHistorySearcher {
  /** A wrapper of chrome.history.search. */
  search(
    query: ISearchParameter,
    callback: (result: ISearchResult) => void
  ): void;
}

export class HistorySearcher implements IHistorySearcher {
  search(
    query: ISearchParameter,
    callback: (result: ISearchResult) => void
  ): void {
    chrome.history.search(query, (results) => {
      callback({
        items: results,
      });
    });
  }
}
