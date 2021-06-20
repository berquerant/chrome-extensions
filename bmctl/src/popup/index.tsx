import "bootstrap";
import "bootstrap-datepicker";
import React from "react";
import * as ReactDOM from "react-dom";
import * as Delay from "../common/Delay";
import * as BCommon from "../bookmarks/Common";
import * as Search from "../bookmarks/Search";
import * as Read from "../bookmarks/Read";
import * as Write from "../bookmarks/Write";
import * as BNative from "../bookmarks/Native";
import { Option, None, asOptional } from "../common/Function";
import * as StateStorage from "../storage/StateStorage";
import * as Storage from "../storage/Storage";
import * as State from "../state/State";
import * as CommonComponent from "../common/Component";
import * as OptionComponent from "../common/OptionComponent";
import * as OptionStateDisplay from "../common/OptionStateDisplay";
import * as OptionStateStorage from "../common/OptionStateStorage";
import { BaseError } from "../common/Err";
import "./Popup.scss";

/** Search box for query visited pages history. */
function SearchBox(props: { onChange: (word: string) => void }) {
  const [word, setWord] = React.useState("");
  const debounceDelayMilliSec = 300;
  // debounce search word changes
  Delay.useDebounceEffect(
    () => props.onChange(word),
    [word],
    debounceDelayMilliSec
  );
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

function SearchDuration(props: { durationMilliSec: number }) {
  const v = Math.ceil(props.durationMilliSec);
  return <label className="search-duration text-mutated">({v} ms)</label>;
}

function ItemCount(props: { count: number }) {
  return <label className="item-count text-mutated">{props.count} hits</label>;
}

function Item(props: { item: BCommon.INode; onClose: () => void }) {
  // Note: react may warn if bookmarks contain risky one, e.g. js
  const url = props.item.info.url;
  const title = props.item.info.title;
  const timestamp = props.item.info.dateAdded;
  const a = (
    <a href={url} target="_blank" rel="noopener norefereer">
      {title}
    </a>
  );
  const opts = [];
  if (timestamp) {
    const t = new Date(timestamp);
    opts.push(`created at ${t.toLocaleString()}`);
  }
  const b = (
    <button
      type="button"
      className="btn-close item-close-button"
      aria-label="Close"
      onClick={() => props.onClose()}
    />
  );
  return (
    <div className="row card item-card">
      <div className="item-body">
        <h6 className="card-title item-card-title">{a}</h6>
        <p className="card-subtitle mb-2 text-mutated item-card-subtitle">
          {url}
        </p>
        <div className="card-text item-card-text">
          {opts.join(" ")}
          {b}
        </div>
      </div>
    </div>
  );
}

function ItemList(props: {
  items: BCommon.INodeList;
  genItemOnClose: (id: BCommon.NodeId) => () => void;
}) {
  const list = () => {
    if (props.items.length == 0) {
      return <div className="item-list-no-item">No results.</div>;
    }
    return props.items.map((x) => {
      const onClose = props.genItemOnClose(x.id);
      return <Item key={x.id} item={x} onClose={() => onClose()} />;
    });
  };
  return <div className="item-list">{list()}</div>;
}

interface IContentProps {
  storage: StateStorage.IOptionStateStorage;
  display: OptionStateDisplay.IOptionStateDisplayManager;
  storageListener: Storage.IStorageAreaListener;
  storageManager: OptionStateStorage.IOptionStateManager;
  searcher: Search.ISearcher;
  remover: Write.IRemover;
  options: Array<OptionStateDisplay.OptionTag>;
}

interface IContentState {
  searchResult: BCommon.INodeList;
  error: Option<Error>;
  searchDuration: Option<number>;
}

class Content extends React.Component<IContentProps, IContentState> {
  private word: string;
  constructor(props: IContentProps) {
    super(props);
    this.state = {
      searchResult: [],
      error: None,
      searchDuration: None,
    };
    this.word = "";
    this.props.storageListener.add(() => this.executeSearch());
  }

  private newSearchDuration(): Option<JSX.Element> {
    if (!this.state.searchDuration.ok) {
      return None;
    }
    return {
      ok: true,
      value: (
        <SearchDuration durationMilliSec={this.state.searchDuration.value} />
      ),
    };
  }

  private newQuery(word: string, state: State.IOptionState): Search.IQuery {
    return {
      word: word,
      queryType: state.queryType,
      queryTargetType: state.queryTargetType,
      sortType: state.sortType,
      sortOrderType: state.sortOrderType,
      filters: state.filters.map(this.fixFilter),
      querySourceMaxResult: asOptional(state.querySourceMaxResult),
      queryMaxResult: asOptional(state.queryMaxResult),
    };
  }
  private fixFilter(f: Search.FilterType): Search.FilterType {
    if (f.kind == "before") {
      return {
        kind: f.kind,
        timestamp: f.timestamp + 24 * 60 * 60, // add 1 day, include end date
      };
    }
    return f;
  }

  executeSearch() {
    const startTime = performance.now(); // measure elapsed time
    this.props.storage
      .read()
      .then((state) =>
        this.props.searcher.search(this.newQuery(this.word, state))
      )
      .then((result) => {
        this.setState({
          ...this.state,
          searchResult: result.filter((r) => r.info.url), // exclude parent
          searchDuration: {
            ok: true,
            value: performance.now() - startTime,
          },
        });
      })
      .catch((e) => this.handleCaughtError(e));
  }

  private newAlert(): Option<JSX.Element> {
    if (!this.state.error.ok) {
      return None;
    }
    // reset error on state when closed
    const onClose = () =>
      this.setState({
        ...this.state,
        error: None,
      });
    const e = this.state.error.value;
    const message = (
      <div>
        <b>{e.name}</b> {e.message}
      </div>
    );
    const c = (
      <div className="col-9">
        <CommonComponent.Alert
          id="popup-alert"
          message={message}
          onClose={() => onClose()}
        />
      </div>
    );
    return { ok: true, value: c };
  }

  handleCaughtError(e: unknown) {
    if (!(e instanceof BaseError)) {
      throw e;
    }
    this.setState({
      ...this.state,
      error: {
        ok: true,
        value: e,
      },
    });
  }

  genHandleItemOnClose(id: BCommon.NodeId): () => void {
    return () => {
      this.props.remover.remove(id);
      this.executeSearch();
    };
  }

  handleSearchBoxChange(word: string) {
    this.word = word;
    this.executeSearch();
  }

  render() {
    const opt = (
      <OptionComponent.OptionTable
        tags={this.props.options}
        store={this.props.storageManager}
        display={this.props.display}
        additionalClassName="table-sm"
      />
    );
    const searchResult = this.state.searchResult;
    const alert = this.newAlert();
    const searchDuration = this.newSearchDuration();
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-3 popover-wrapper">
            <CommonComponent.Popover id="popover-bmctl-option" content={opt} />
          </div>
          <div className="col-9 search-wrapper">
            <SearchBox onChange={(w) => this.handleSearchBoxChange(w)} />
          </div>
        </div>
        <div className="row result-info">
          <div className="col">
            <ItemCount count={searchResult.length} />
            {searchDuration.ok && searchDuration.value}
          </div>
          {alert.ok && alert.value}
        </div>
        <div className="row result">
          <div className="col">
            <ItemList
              items={searchResult}
              genItemOnClose={(id) => this.genHandleItemOnClose(id)}
            />
          </div>
        </div>
      </div>
    );
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, (_) => {
  const tags = [
    OptionStateDisplay.OptionTag.queryType,
    OptionStateDisplay.OptionTag.queryTargetType,
    OptionStateDisplay.OptionTag.sortType,
    OptionStateDisplay.OptionTag.sortOrderType,
    OptionStateDisplay.OptionTag.queryMaxResult,
    OptionStateDisplay.OptionTag.querySourceMaxResult,
    OptionStateDisplay.OptionTag.filterAfter,
    OptionStateDisplay.OptionTag.filterBefore,
  ];
  const storage = StateStorage.newIOptionStateStorage(
    Storage.newLocalStorageArea(),
    State.newIOptionStateBuilder
  );
  const display = OptionStateDisplay.newIOptionStateDisplayManager(
    State.newIOptionStateBuilder
  );
  const storageManager = OptionStateStorage.newIOptionStateManager(
    storage,
    display
  );
  const storageListener = Storage.newIStorageAreaListener();
  const api = BNative.newIBookmarksAPI();
  const searcher = Search.newISearcher(Read.newIScanner(api));
  const remover = Write.newIRemover(api);
  ReactDOM.render(
    <Content
      options={tags}
      storage={storage}
      searcher={searcher}
      remover={remover}
      display={display}
      storageListener={storageListener}
      storageManager={storageManager}
    />,
    document.getElementById("popup")
  );
});
