import "bootstrap";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Popup from "@/popup/Popup";

chrome.tabs.query({ active: true, currentWindow: true }, (_) => {
  ReactDOM.render(<Popup />, document.getElementById("popup"));
});
