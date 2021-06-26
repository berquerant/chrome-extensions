import React, { useEffect } from "react";
import { SelectItems, DatePicker } from "../common/Component";
import { OptionTag, IOptionStateDisplayManager } from "./OptionStateDisplay";
import { IOptionStateManager } from "./OptionStateStorage";
import * as Err from "../common/Err";
import * as Search from "../bookmarks/Search";
import * as State from "../state/State";

interface IOptionRowProps {
  tag: OptionTag;
  title: string;
  content: JSX.Element;
}

function OptionTableRow(props: IOptionRowProps) {
  return (
    <tr className="option-table-row" key={String(props.tag)}>
      <td>{props.title}</td>
      <td>{props.content}</td>
    </tr>
  );
}

function OptionPageRow(props: IOptionRowProps) {
  return (
    <div className="option-page-row row" key={String(props.tag)}>
      <h2 className="col">{props.title}</h2>
      <div className="col">{props.content}</div>
      <hr />
    </div>
  );
}

/** Tag for option to actual html element mapper. */
function OptionTableMapper(props: {
  tag: OptionTag;
  newRow: (props: IOptionRowProps) => JSX.Element;
}) {
  const tag = props.tag;
  const id = String(tag);
  const selectItems = (items: { [key: string]: unknown }) => (
    <SelectItems id={id} items={items} className="option-table-select" />
  );
  const inputItem = () => (
    <input
      id={id}
      type="number"
      min="1"
      step="1"
      defaultValue="1"
      className="option-table-input"
      required
    />
  );
  const dateItem = () => <DatePicker id={id} className="option-table-date" />;
  const toRow = (title: string, content: JSX.Element) =>
    props.newRow({
      tag: tag,
      title: title,
      content: content,
    });
  switch (props.tag) {
    case OptionTag.queryType:
      return toRow("Query Type", selectItems(Search.QueryType));
    case OptionTag.queryTargetType:
      return toRow("Query Target Type", selectItems(Search.QueryTargetType));
    case OptionTag.sortType:
      return toRow("Sort Type", selectItems(Search.SortType));
    case OptionTag.sortOrderType:
      return toRow("Sort Order Type", selectItems(Search.SortOrderType));
    case OptionTag.queryMaxResult:
      return toRow("Query Max Result", inputItem());
    case OptionTag.querySourceMaxResult:
      return toRow("Query Source Max Result", inputItem());
    case OptionTag.filterAfter:
      return toRow("Filter After", dateItem());
    case OptionTag.filterBefore:
      return toRow("Filter Before", dateItem());
  }
  throw new Err.UnknownError(`OptionTag: ${tag}`);
}

interface IOptionCommonProps {
  items: Array<JSX.Element>;
  saveBtn: JSX.Element;
  resetBtn: JSX.Element;
}

function setupOptionCommonSettings(
  tags: Array<OptionTag>,
  store: IOptionStateManager,
  display: IOptionStateDisplayManager,
  newRow: (props: IOptionRowProps) => JSX.Element,
  defaultState: State.IOptionState
): IOptionCommonProps {
  const items = Object.values(tags).map((x) => (
    <OptionTableMapper tag={x} newRow={newRow} key={String(x)} />
  ));
  const save = (
    <button
      id={String(OptionTag.saveButton)}
      className="btn btn-success"
      onClick={() => store.write(tags)}
    >
      Save
    </button>
  );
  const reset = (
    <button
      id={String(OptionTag.resetButton)}
      className="btn btn-secondary"
      onClick={() => display.write(defaultState, tags)}
    >
      Reset
    </button>
  );
  // read state from storage after rendering
  useEffect(() => {
    const f = async () => {
      await store.read(tags);
    };
    f();
  });
  return {
    items: items,
    saveBtn: save,
    resetBtn: reset,
  };
}

/** Content for option page. */
export function OptionPage(props: {
  tags: Array<OptionTag>;
  store: IOptionStateManager;
  display: IOptionStateDisplayManager;
}) {
  const r = setupOptionCommonSettings(
    props.tags,
    props.store,
    props.display,
    (props: IOptionRowProps) => <OptionPageRow {...props} />,
    State.newIOptionStateBuilder().build()
  );
  return (
    <div className="container">
      <h1 className="row">bmctl options</h1>
      {r.items}
      <div className="row">
        <div className="col"></div>
        <div className="col">{r.saveBtn}</div>
        <div className="col">{r.resetBtn}</div>
        <div className="col"></div>
      </div>
    </div>
  );
}

// Content for settings on popup.
export function OptionTable(props: {
  tags: Array<OptionTag>;
  store: IOptionStateManager;
  display: IOptionStateDisplayManager;
  additionalClassName?: string;
}) {
  const r = setupOptionCommonSettings(
    props.tags,
    props.store,
    props.display,
    (props: IOptionRowProps) => <OptionTableRow {...props} />,
    State.newIOptionStateBuilder().build()
  );
  return (
    <div className="container-fluid">
      <table
        className={`row table option-table ${props.additionalClassName || ""}`}
      >
        <tbody>{r.items}</tbody>
      </table>
      <div className="row">
        <div className="col">{r.saveBtn}</div>
        <div className="col">{r.resetBtn}</div>
      </div>
    </div>
  );
}
