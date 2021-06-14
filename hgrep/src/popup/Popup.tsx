import React, { useEffect } from "react";
import * as Search from "./Search";
import * as State from "../common/State";
import * as Delete from "../common/Delete";
import * as Err from "../common/Error";
import {
  HistorySearcher,
  ISearchResult,
  ISearchResultItem,
} from "../common/Search";
import { Options } from "./Options";
import { Popover } from "./Popover";
import { useDebounceEffect } from "./Delay";
import "./Popup.scss";

/** Minimal bootstrap danger alert. */
function Alert(props: {
  id: string;
  message: JSX.Element;
  onClose: () => void;
}) {
  // add listener after rendering
  useEffect(() => {
    document
      .getElementById(props.id)
      .addEventListener("close.bs.alert", props.onClose);
  });
  return (
    <div
      id={props.id}
      className="alert alert-danger alert-dismissible fade show popup-alert"
      role="alert"
    >
      {props.message}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      />
    </div>
  );
}

/** Search box for query visited pages history. */
function SearchBox(props: { onChange: (word: string) => void }) {
  const [word, setWord] = React.useState("");
  const debounceDelayMilliSec = 300;
  // debounce search word changes
  useDebounceEffect(() => props.onChange(word), [word], debounceDelayMilliSec);
  return (
    <input
      type="text"
      className="search-box"
      placeholder="word"
      value={word}
      onChange={(e) => setWord(e.target.value)}
      autoFocus
    />
  );
}

/** A result item of query of history. */
function Item(props: { item: ISearchResultItem; onClose?: () => void }) {
  const item = props.item;
  const url = item.url;
  const title = item.title || "No title.";
  const a = (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {title}
    </a>
  );
  const options = () => {
    const v = [];
    {
      const x = item.visitCount;
      if (x) {
        v.push(`visited ${x} times`);
      }
    }
    {
      const x = item.typedCount;
      if (x) {
        v.push(`typed ${x} times`);
      }
    }
    {
      const x = item.lastVisitTime;
      if (x) {
        const d = new Date(x).toLocaleString();
        v.push(`last ${d}`);
      }
    }
    return v.join(" ");
  };
  const genButton = () => {
    if (props.onClose) {
      const b = (
        <button
          type="button"
          className="btn-close item-close-button"
          aria-label="Close"
          onClick={() => props.onClose()}
        />
      );
      return { exist: true, button: b };
    }
    return { exist: false };
  };
  const b = genButton();
  return (
    <div className="row card item-card">
      <div className="card-body">
        <h6 className="card-title item-card-title">{a}</h6>
        <p className="card-subtitle mb-2 text-mutated item-card-subtitle">
          {url}
        </p>
        <div className="card-text item-card-text">
          {options()}
          {b.exist && b.button}
        </div>
      </div>
    </div>
  );
}

/** Results of query of history. */
function ItemList(props: {
  items: ReadonlyArray<ISearchResultItem>;
  genItemOnClose: (url: string) => () => void;
}) {
  const items = props.items;
  const genOnClose = (url?: string) => {
    if (url) {
      return {
        exist: true,
        callback: props.genItemOnClose(url),
      };
    }
    return { exist: false };
  };
  const list = () => {
    if (items.length == 0) {
      return <div className="no-item">No results.</div>;
    }
    return items.map((x) => {
      const onClose = genOnClose(x.url);
      if (onClose.exist) {
        return <Item key={x.id} item={x} onClose={() => onClose.callback()} />;
      }
      return <Item key={x.id} item={x} />;
    });
  };
  return <div className="item-list">{list()}</div>;
}

/** Size of results of query of history. */
function ItemCount(props: { count: number }) {
  return <label className="item-count text-muted">{props.count} hits</label>;
}

interface IContentProps {
  newSearcher: (config: State.IOptionListState) => Search.ISearcher;
  newBuilder: () => State.IOptionListStateBuilder;
  deleter: Delete.IHistoryDeleter;
  storage: State.IOptionListStateStorage;
  storageEventManager: State.IOptionListStateEventOnChanged;
}

interface IContentState {
  result: ISearchResult;
  error?: Err.BaseError;
}

/**
 * The main part of this chrome extension.
 * This contains history search and setting UI.
 */
class Content extends React.Component<IContentProps, IContentState> {
  private word: string;
  constructor(props: IContentProps) {
    super(props);
    this.state = {
      result: {
        items: [],
      },
    };
    this.word = "";
    // rerender search results when configuration changes
    this.props.storageEventManager.addListener((_) => {
      this.handleWordChange();
    });
  }

  /** Run search. */
  handleWordChange() {
    this.props.storage.read((state) => {
      try {
        this.props.newSearcher(state).search(this.word, (result) => {
          this.setState({
            ...this.state,
            result: result,
          });
        });
      } catch (e) {
        this.handleCaughtError(e);
      }
    });
  }

  handleCaughtError(e: unknown) {
    if (e instanceof Err.BaseError) {
      this.setState({
        ...this.state,
        error: e,
      });
      return;
    }
    throw e;
  }

  newAlert(): { exist: boolean; content?: JSX.Element } {
    if (this.state.error) {
      // reset error on state when closed
      const onClose = () =>
        this.setState({
          ...this.state,
          error: null,
        });
      const e = this.state.error;
      const message = (
        <div>
          <b>{e.name}</b> {e.message}
        </div>
      );
      const c = (
        <div className="col-9">
          <Alert id="popup-alert" message={message} onClose={() => onClose()} />
        </div>
      );
      return { exist: true, content: c };
    }
    return { exist: false };
  }

  handleSearchBoxChange(word: string) {
    this.word = word;
    this.handleWordChange();
  }

  genHandleItemOnClose(url: string): () => void {
    return () => {
      this.props.deleter.deleteUrl({ url: url });
      this.handleWordChange();
    };
  }

  render() {
    const items = this.state.result.items;
    const opt = (
      <Options
        storage={this.props.storage}
        newBuilder={this.props.newBuilder}
      />
    );
    const alertMsg = this.newAlert(); // display alert when some error exist
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-3 popover-wrapper">
            <Popover id="popover-hgrep-options" content={opt} />
          </div>
          <div className="col-9 search">
            <SearchBox onChange={(w) => this.handleSearchBoxChange(w)} />
          </div>
        </div>
        <div className="row result-info">
          <div className="col">
            <ItemCount count={items.length} />
          </div>
          {alertMsg.exist && alertMsg.content}
        </div>
        <div className="row result">
          <div className="col">
            <ItemList
              items={items}
              genItemOnClose={(url: string) => this.genHandleItemOnClose(url)}
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * The enrtypoint of this chrome extension.
 */
export default function Popup() {
  const newBuilder = () => new State.OptionListStateBuilder();
  const history = new HistorySearcher();
  const newSearcher = (config: State.IOptionListState) =>
    new Search.Searcher(history, config);
  const deleter = new Delete.HistoryDeleter();
  const storage = new State.OptionListStateStorage(
    newBuilder,
    () => new State.OptionListStateFlattener(),
    new State.LocalStorageArea()
  );
  const storageEventManager = new State.OptionListStateEventOnChanged();
  return (
    <Content
      newBuilder={newBuilder}
      newSearcher={newSearcher}
      deleter={deleter}
      storage={storage}
      storageEventManager={storageEventManager}
    />
  );
}
