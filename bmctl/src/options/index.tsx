import "bootstrap";
import "bootstrap-datepicker";
import "./Options.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { OptionPage } from "../common/OptionComponent";
import { newIOptionStateManager } from "../common/OptionStateStorage";
import {
  OptionTag,
  newIOptionStateDisplayManager,
} from "../common/OptionStateDisplay";
import { newIOptionStateStorage } from "../storage/StateStorage";
import { newLocalStorageArea } from "../storage/Storage";
import { newIOptionStateBuilder } from "../state/State";

chrome.tabs.query({ active: true, currentWindow: true }, (_) => {
  const display = newIOptionStateDisplayManager(newIOptionStateBuilder);
  const store = newIOptionStateManager(
    newIOptionStateStorage(newLocalStorageArea(), newIOptionStateBuilder),
    display
  );
  const tags = [
    OptionTag.queryType,
    OptionTag.queryTargetType,
    OptionTag.sortType,
    OptionTag.sortOrderType,
    OptionTag.queryMaxResult,
    OptionTag.querySourceMaxResult,
    OptionTag.filterAfter,
    OptionTag.filterBefore,
  ];
  ReactDOM.render(
    <OptionPage store={store} display={display} tags={tags} />,
    document.getElementById("options")
  );
});
