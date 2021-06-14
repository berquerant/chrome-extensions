export interface IDeleteParameter {
  url: string;
}

/** A partial wrapper of chrome history API. */
export interface IHistoryDeleter {
  /** A wrapper of chrome.history.deleteUrl. */
  deleteUrl(param: IDeleteParameter, callback?: () => void): void;
}

export class HistoryDeleter implements IHistoryDeleter {
  deleteUrl(param: IDeleteParameter, callback?: () => void): void {
    chrome.history.deleteUrl(param, callback);
  }
}
