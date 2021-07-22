import React from "react";
import * as BCommon from "../bookmarks/Common";
import { Some, None } from "../common/Function";

/** Base component of an item of search result.  */
function BaseItem(props: {
  item: BCommon.INode;
  content: JSX.Element;
}): JSX.Element {
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
