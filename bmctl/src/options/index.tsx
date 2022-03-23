import "bootstrap";
import "@/options/Options.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { OptionPage } from "@/optionstate/OptionComponent";
import { newIOptionStateStorage } from "@/storage/StateStorage";
import { newLocalStorageArea } from "@/storage/Storage";
import { newIOptionStateBuilder } from "@/state/State";
import { newIFuzzySearcher } from "@/common/Search";
import { newISearcher } from "@/bookmarks/Folder";
import { newIBookmarksAPI } from "@/bookmarks/Native";
import { newIScanner } from "@/bookmarks/Read";

chrome.tabs.query({ active: true, currentWindow: true }, (_) => {
  const folderSearcher = newISearcher(
    newIScanner(newIBookmarksAPI()),
    newIFuzzySearcher(["info.path.str"])
  );
  const store = newIOptionStateStorage(
    newLocalStorageArea(),
    newIOptionStateBuilder
  );
  ReactDOM.render(
    <OptionPage
      store={store}
      newBuilder={newIOptionStateBuilder}
      folderSearcher={folderSearcher}
    />,
    document.getElementById("options")
  );
});
