import "bootstrap";
import "@/options/Options.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { OptionPage } from "@/optionstate/OptionComponent";
import { newIOptionStateStorage } from "@/storage/StateStorage";
import { newLocalStorageArea } from "@/storage/Storage";
import { newIOptionStateBuilder } from "@/state/State";

chrome.tabs.query({ active: true, currentWindow: true }, (_) => {
  const store = newIOptionStateStorage(
    newLocalStorageArea(),
    newIOptionStateBuilder
  );
  ReactDOM.render(
    <OptionPage store={store} newBuilder={newIOptionStateBuilder} />,
    document.getElementById("options")
  );
});
