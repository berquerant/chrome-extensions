import "bootstrap";
import "bootstrap-datepicker";
import React from "react";
import * as ReactDOM from "react-dom";
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
import * as OptionComponent from "../optionstate/OptionComponent";
import * as OptionStateDisplay from "../optionstate/OptionStateDisplay";
import * as OptionStateStorage from "../optionstate/OptionStateStorage";
import { BaseError } from "../common/Err";
import { ItemList } from "./Item";
import { ItemCount, SearchDuration, SearchBox } from "./Search";
import { DataModal } from "./Data";
import "./Popup.scss";

interface IContentProps {
  storage: StateStorage.IOptionStateStorage;
  display: OptionStateDisplay.IOptionStateDisplayManager;
  storageListener: Storage.IStorageAreaListener;
  storageManager: OptionStateStorage.IOptionStateManager;
  searcher: Search.ISearcher;
  remover: Write.IRemover;
  options: Array<OptionStateDisplay.OptionTag>;
  creator: Write.ICreator;
  scanner: Read.IScanner;
}

interface IContentState {
  searchResult: BCommon.INodeList;
  error: Option<Error>;
  searchDuration: Option<number>;
  folders: BCommon.INodeList;
}

class Content extends React.Component<IContentProps, IContentState> {
  private word: string;
  constructor(props: IContentProps) {
    super(props);
    this.state = {
      searchResult: [],
      error: None,
      searchDuration: None,
      folders: [],
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
  private getFolders(): void {
    this.props.scanner
      .scan()
      .then((r) =>
        Array.from(r.values()).filter((x) => !x.info.url && x.id != "0")
      ) // ignore bookmarks and root folder
      .then((r) => {
        this.setState({
          folders: r,
        });
      })
      .catch((e) => this.handleCaughtError(e));
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
    this.getFolders();
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
        creator={this.props.creator}
        folders={this.state.folders}
      />
    );
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-2 popover-wrapper">
            <CommonComponent.Popover id="popover-bmctl-option" content={opt} />
          </div>
          <div className="col-2 popover-data-modal">{dataModal}</div>
          <div className="col-8 search-wrapper">
            <SearchBox onChange={(w) => this.handleSearchBoxChange(w)} />
          </div>
        </div>
        <div className="row result-info justify-content-between">
          <div className="col">
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
  const scanner = Read.newIScanner(api);
  const searcher = Search.newISearcher(scanner);
  const remover = Write.newIRemover(api);
  const creator = Write.newICreator(api);
  ReactDOM.render(
    <Content
      options={tags}
      storage={storage}
      searcher={searcher}
      remover={remover}
      creator={creator}
      scanner={scanner}
      display={display}
      storageListener={storageListener}
      storageManager={storageManager}
    />,
    document.getElementById("popup")
  );
});
