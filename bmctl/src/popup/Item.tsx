import React from "react";
import * as BCommon from "../bookmarks/Common";
import { Some, None } from "../common/Function";
import { FadeOutTooltip } from "../common/Component";
import * as Clipboard from "../common/Clipboard";

/** Base component of an item of search result.  */
function BaseItem(props: {
  item: BCommon.INode;
  content: JSX.Element;
}): JSX.Element {
  const id = `base-item-${props.item.id}`;
  // Note: react may warn if bookmarks contain risky one, e.g. js
  const url = props.item.info.url;
  const title = props.item.info.title;
  const timestamp = props.item.info.dateAdded;
  const a = (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {title}
    </a>
  );
  const opts = [];
  if (timestamp) {
    const t = new Date(timestamp);
    opts.push(`created at ${t.toLocaleString()}`);
  }
  const clipboardUrlIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-clipboard item-card-url-icon"
      viewBox="0 0 16 16"
    >
      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
    </svg>
  );
  const urlTooltip = (
    <div className="item-card-url-tooltip">
      <FadeOutTooltip
        id={`${id}-url`}
        button={clipboardUrlIcon}
        content="Copied!"
        onClick={() => Clipboard.Write(url)}
      />
    </div>
  );
  return (
    <div className="row card item-card">
      <div className="item-body">
        <h6 className="card-title item-card-title">{a}</h6>
        <div className="card-subtitle mb-2 text-mutated item-card-subtitle">
          {urlTooltip}
          {url}
        </div>
        <div className="card-text item-card-text">
          {opts.join(" ")}
          {props.content}
        </div>
      </div>
    </div>
  );
}

/** Search result item with checkbox. */
export function CheckItem(props: {
  id: string;
  item: BCommon.INode;
  onChange: (checked: boolean) => void;
  checked: boolean;
}): JSX.Element {
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
function Item(props: {
  item: BCommon.INode;
  onClose?: () => void;
}): JSX.Element {
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

/** Search result item list. */
export function ItemList(props: {
  items: BCommon.INodeList;
  genItemOnClose?: (id: BCommon.NodeId) => () => void;
}): JSX.Element {
  const list = () => {
    if (props.items.length == 0) {
      return <div className="item-list-no-item">No results.</div>;
    }
    return props.items.map((x) => {
      if (!props.genItemOnClose) {
        return <Item key={x.id} item={x} />;
      }
      const onClose = props.genItemOnClose(x.id);
      return <Item key={x.id} item={x} onClose={() => onClose()} />;
    });
  };
  return <div className="item-list">{list()}</div>;
}
