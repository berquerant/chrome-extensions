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
import { Option, None, Some, asOptional } from "../common/Function";
import * as StateStorage from "../storage/StateStorage";
import * as Storage from "../storage/Storage";
import * as State from "../state/State";
import * as CommonComponent from "../common/Component";
import * as OptionComponent from "../common/OptionComponent";
import * as OptionStateDisplay from "../common/OptionStateDisplay";
import * as OptionStateStorage from "../common/OptionStateStorage";
import * as Log from "../log/Log";
import { ISet, newISet } from "../collections/Set";
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

/** Base component of an item of search result.  */
function BaseItem(props: { item: BCommon.INode; content: JSX.Element }) {
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
  return (
    <div className="row card item-card">
      <div className="item-body">
        <h6 className="card-title item-card-title">{a}</h6>
        <p className="card-subtitle mb-2 text-mutated item-card-subtitle">
          {url}
        </p>
        <div className="card-text item-card-text">
          {opts.join(" ")}
          {props.content}
        </div>
      </div>
    </div>
  );
}

/** Search result item with checkbox. */
function CheckItem(props: {
  id: string;
  item: BCommon.INode;
  onChange: (checked: boolean) => void;
  checked: boolean;
}) {
  const onChange = () => {
    const x = document.getElementById(props.id) as HTMLInputElement;
    props.onChange(x.checked);
  };
  const c = (
    <input
      className="form-check-input"
      type="checkbox"
      value=""
      id={props.id}
      onChange={() => onChange()}
      checked={props.checked}
    />
  );
  return (
    <div className="form-check">
      <BaseItem item={props.item} content={c} />
    </div>
  );
}

/** Search result item. */
function Item(props: { item: BCommon.INode; onClose?: () => void }) {
  const b = props.onClose
    ? Some(
        <button
          type="button"
          className="btn-close item-close-button"
          aria-label="Close"
          onClick={() => props.onClose()}
        />
      )
    : None;
  return <BaseItem item={props.item} content={b.ok && b.value} />;
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

interface IDataModalProps {
  id: string;
  /** data source */
  items: BCommon.INodeList;
  /** title of modal */
  title: string;
  /** title of modal trigger button */
  triggerTitle: string;
  /** hook on modal close */
  onClose?: () => void;
  remover: Write.IRemover;
}

interface IDataModalState {
  /** target of operation */
  target: ISet<BCommon.NodeId>;
}

/** Modal for data operation. */
class DataModal extends React.Component<IDataModalProps, IDataModalState> {
  constructor(props: IDataModalProps) {
    super(props);
    this.state = {
      target: newISet(),
    };
  }
  private genHandleItemOnChange(itemId: string): (checked: boolean) => void {
    return (checked: boolean) => {
      const t = this.state.target.clone();
      if (checked) {
        t.add(itemId);
      } else {
        t.delete(itemId);
      }
      this.setState({
        ...this.state,
        target: t,
      });
    };
  }
  private handleAllCheckAction(checked: boolean): void {
    const t = newISet<string>();
    if (checked) {
      this.props.items.forEach((x) => {
        t.add(x.id);
      });
    }
    this.setState({
      ...this.state,
      target: t,
    });
  }
  private handleDeleteAction(): void {
    Array.from(this.state.target.values()).forEach((x) => {
      this.props.remover.remove(x);
    });
    this.setState({
      ...this.state,
      target: newISet()
    });
    // get close button on modal header (x)
    const modal = document.getElementById(this.props.id);
    const closeButton = modal.getElementsByClassName(
      "close"
    )[0] as HTMLButtonElement;
    // close parent modal
    closeButton.click();
  }
  private exportModal() {
    const items = this.props.items.filter((x) => this.state.target.has(x.id));
    const disabled = items.length == 0;
    const json = JSON.stringify(items, null, 2);
    const content = (
      <textarea
        cols={67}
        className="data-modal-export-modal-textarea"
        rows={20}
        value={json}
        readOnly
      />
    );
    const body = (
      <div className="container-fluid">
        <div className="row">
          <div className="col">{content}</div>
        </div>
      </div>
    );
    return (
      <CommonComponent.LightModal
        id="data-modal-export-modal"
        triggerTitle="Export"
        title="Export Items"
        body={body}
        disabled={disabled}
      />
    );
  }
  render() {
    // items with checkbox
    const items = this.props.items.map((x) => {
      const checked = this.state.target.has(x.id);
      const onChange = this.genHandleItemOnChange(x.id);
      const id = `data-modal-checkbox-${x.id}`;
      return (
        <CheckItem
          key={id}
          id={id}
          item={x}
          checked={checked}
          onChange={(c) => onChange(c)}
        />
      );
    });
    const body = <div>{items}</div>;
    // label to display number of items
    const counter = (
      <label>
        {this.state.target.size()} / {this.props.items.length} selected
      </label>
    );
    // button to check all items
    const allButton = (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => this.handleAllCheckAction(true)}
      >
        All
      </button>
    );
    // button to uncheck all items
    const clearButton = (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => this.handleAllCheckAction(false)}
      >
        Clear
      </button>
    );
    // button to delete items
    const deleteButton = (
      <CommonComponent.ConfirmModal
        title="Are you sure?"
        triggerTitle="Delete"
        triggerStyle="danger"
        okTitle="Delete"
        okStyle="danger"
        onOk={() => this.handleDeleteAction()}
        disabled={this.state.target.size() == 0}
      />
    );
    // button to display items as json
    const exportButton = this.exportModal();
    const footer = (
      <div className="data-modal-footer container">
        <div className="data-modal-footer-buttons row">
          <div className="data-modal-footer-button-all col-2">{allButton}</div>
          <div className="data-modal-footer-button-clear col">
            {clearButton}
          </div>
          <div className="data-modal-footer-button-export col">
            {exportButton}
          </div>
          <div className="data-modal-footer-button-delete col">
            {deleteButton}
          </div>
        </div>
        <div className="data-modal-footer-info row">{counter}</div>
      </div>
    );
    return (
      <CommonComponent.LightModal
        id={this.props.id}
        triggerTitle={this.props.triggerTitle}
        title={this.props.title}
        body={body}
        footer={footer}
        disabled={this.props.items.length == 0}
        onClose={this.props.onClose}
      />
    );
  }
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
    return Some(
      <SearchDuration durationMilliSec={this.state.searchDuration.value} />
    );
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

  private executeSearch(): void {
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
          searchDuration: Some(performance.now() - startTime),
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
    return Some(c);
  }

  private handleCaughtError(e: unknown): void {
    if (!(e instanceof BaseError)) {
      throw e;
    }
    this.setState({
      ...this.state,
      error: Some(e),
    });
  }

  private genHandleItemOnClose(id: BCommon.NodeId): () => void {
    return () => {
      this.props.remover.remove(id);
      this.executeSearch();
    };
  }

  private handleSearchBoxChange(word: string): void {
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
    const dataModal = (
      <DataModal
        id="data-modal"
        triggerTitle="Operation"
        title="Batch Operation"
        items={this.state.searchResult}
        onClose={() => this.executeSearch()}
        remover={this.props.remover}
      />
    );
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
        <div className="row result-info justify-content-between">
          <div className="col-4">{dataModal}</div>
          <div className="col-4">
            <ItemCount count={searchResult.length} />
            {searchDuration.ok && searchDuration.value}
          </div>
        </div>
        <div className="row result-error">{alert.ok && alert.value}</div>
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
