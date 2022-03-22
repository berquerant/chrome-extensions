import React from "react";
import { SelectItems, DatePicker } from "@/common/Component";
import * as StateStorage from "@/storage/StateStorage";
import * as Search from "@/bookmarks/Search";
import * as State from "@/state/State";
import * as Time from "@/common/Time";
import * as Err from "@/common/Err";

/** A kind of settings. */
const OptionTag = {
  queryType: "query-type",
  queryTargetType: "query-target-type",
  sortType: "sort-type",
  sortOrderType: "sort-order-type",
  filterAfter: "filter-after",
  filterBefore: "filter-before",
  querySourceMaxResult: "query-source-max-result",
  queryMaxResult: "query-max-result",
  saveButton: "save-options",
  resetButton: "reset-options",
} as const;
type OptionTag = typeof OptionTag[keyof typeof OptionTag];

interface IOptionRowProps {
  title: string;
  content: JSX.Element;
}

function OptionTableRow(props: IOptionRowProps): JSX.Element {
  return (
    <tr className="option-table-row">
      <td>{props.title}</td>
      <td>{props.content}</td>
    </tr>
  );
}

function OptionPageRow(props: IOptionRowProps): JSX.Element {
  return (
    <div className="option-page-row row">
      <h2 className="col">{props.title}</h2>
      <div className="col">{props.content}</div>
      <hr />
    </div>
  );
}

function OptionMapper(props: {
  tag: OptionTag;
  toRow: (props: IOptionRowProps) => JSX.Element;
  onChange: (v: string) => void;
  value: string;
}): JSX.Element {
  const tag = props.tag;
  const id = String(tag);
  const selectItems = (items: { [key: string]: unknown }) => (
    <SelectItems
      id={id}
      items={items}
      className="option-table-select"
      onChange={props.onChange}
      value={props.value}
    />
  );
  const inputItem = () => (
    <input
      id={id}
      type="number"
      min="1"
      step="1"
      className="option-table-input"
      value={props.value}
      onChange={(e) => props.onChange(e.currentTarget.value)}
    />
  );
  const dateItem = () => (
    <DatePicker
      id={id}
      className="option-table-date"
      onChange={props.onChange}
      value={props.value}
    />
  );
  const toRow = (title: string, content: JSX.Element) =>
    props.toRow({
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

interface IOptionBaseRenderProps {
  items: Array<JSX.Element>;
  saveBtn: JSX.Element;
  resetBtn: JSX.Element;
}

interface IOptionBaseTableProps {
  store: StateStorage.IOptionStateStorage;
  newBuilder: () => State.IOptionStateBuilder;
  toRow: (props: IOptionRowProps) => JSX.Element;
  defaultState: IOptionBaseTableState;
  render: (ps: IOptionBaseRenderProps) => JSX.Element;
}

interface IOptionBaseTableState {
  queryType: string;
  queryTargetType: string;
  sortType: string;
  sortOrderType: string;
  queryMaxResult: string;
  querySourceMaxResult: string;
  filterAfter: string;
  filterBefore: string;
}

class OptionBase extends React.Component<
  IOptionBaseTableProps,
  IOptionBaseTableState
> {
  constructor(props: IOptionBaseTableProps) {
    super(props);
    this.state = this.props.defaultState;
  }
  componentDidMount(): void {
    this.props.store.read().then((s) => {
      const bs = {
        queryType: s.queryType,
        queryTargetType: s.queryTargetType,
        sortType: s.sortType,
        sortOrderType: s.sortOrderType,
        queryMaxResult: s.queryMaxResult.ok
          ? String(s.queryMaxResult.value)
          : "",
        querySourceMaxResult: s.querySourceMaxResult.ok
          ? String(s.querySourceMaxResult.value)
          : "",
        filterAfter: "",
        filterBefore: "",
      };
      s.filters
        .filter((x) => x.kind == "after")
        .forEach((x) => {
          bs.filterAfter = Time.dateToTimestring(
            new Date(x["timestamp"] * 1000)
          );
        });
      s.filters
        .filter((x) => x.kind == "before")
        .forEach((x) => {
          bs.filterBefore = Time.dateToTimestring(
            new Date(x["timestamp"] * 1000)
          );
        });
      this.setState(bs);
    });
  }
  handleSave(): void {
    const s = this.state;
    const b = this.props
      .newBuilder()
      .queryType(s.queryType)
      .queryTargetType(s.queryTargetType)
      .sortType(s.sortType)
      .sortOrderType(s.sortOrderType)
      .queryMaxResult(s.queryMaxResult || undefined)
      .querySourceMaxResult(s.querySourceMaxResult || undefined);
    const filters = [];
    {
      const ts = Time.timestringToDate(s.filterAfter);
      if (ts.ok) {
        filters.push({
          kind: "after",
          timestamp: Math.floor(ts.value.getTime() / 1000),
        });
      }
    }
    {
      const ts = Time.timestringToDate(s.filterBefore);
      if (ts.ok) {
        filters.push({
          kind: "before",
          timestamp: Math.floor(ts.value.getTime() / 1000),
        });
      }
    }
    b.filters(filters);
    this.props.store.write(b.build());
  }
  render(): JSX.Element {
    const items = this.renderItems();
    const save = (
      <button
        id={String(OptionTag.saveButton)}
        className="btn btn-success"
        onClick={() => this.handleSave()}
      >
        Save
      </button>
    );
    const reset = (
      <button
        id={String(OptionTag.resetButton)}
        className="btn btn-secondary"
        onClick={() => this.setState(this.props.defaultState)}
      >
        Reset
      </button>
    );
    return this.props.render({
      items: items,
      saveBtn: save,
      resetBtn: reset,
    });
  }
  private renderItems(): Array<JSX.Element> {
    const s = this.state;
    const settings = [
      {
        tag: OptionTag.queryType,
        value: s.queryType,
        onChange: (v: string) => this.setState({ queryType: v }),
      },
      {
        tag: OptionTag.queryTargetType,
        value: s.queryTargetType,
        onChange: (v: string) => this.setState({ queryTargetType: v }),
      },
      {
        tag: OptionTag.sortType,
        value: s.sortType,
        onChange: (v: string) => this.setState({ sortType: v }),
      },
      {
        tag: OptionTag.sortOrderType,
        value: s.sortOrderType,
        onChange: (v: string) => this.setState({ sortOrderType: v }),
      },
      {
        tag: OptionTag.queryMaxResult,
        value: s.queryMaxResult,
        onChange: (v: string) => this.setState({ queryMaxResult: v }),
      },
      {
        tag: OptionTag.querySourceMaxResult,
        value: s.querySourceMaxResult,
        onChange: (v: string) => this.setState({ querySourceMaxResult: v }),
      },
      {
        tag: OptionTag.filterAfter,
        value: s.filterAfter,
        onChange: (v: string) => this.setState({ filterAfter: v }),
      },
      {
        tag: OptionTag.filterBefore,
        value: s.filterBefore,
        onChange: (v: string) => this.setState({ filterBefore: v }),
      },
    ];
    return settings.map((x) => (
      <OptionMapper
        key={String(x.tag)}
        tag={x.tag}
        value={x.value}
        onChange={x.onChange}
        toRow={this.props.toRow}
      />
    ));
  }
}

function defaultState(): IOptionBaseTableState {
  return {
    queryType: Search.QueryType.Raw,
    queryTargetType: Search.QueryTargetType.Title,
    sortType: Search.SortType.Timestamp,
    sortOrderType: Search.SortOrderType.Desc,
    queryMaxResult: "",
    querySourceMaxResult: "",
    filterAfter: "",
    filterBefore: "",
  };
}

/** Content for option page. */
export function OptionPage(props: {
  store: StateStorage.IOptionStateStorage;
  newBuilder: () => State.IOptionStateBuilder;
}): JSX.Element {
  const render = (r: IOptionBaseRenderProps) => (
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
  return (
    <OptionBase
      store={props.store}
      newBuilder={props.newBuilder}
      defaultState={defaultState()}
      render={render}
      toRow={(x) => <OptionPageRow {...x} />}
    />
  );
}

// Content for settings on popup.
export function OptionTable(props: {
  store: StateStorage.IOptionStateStorage;
  newBuilder: () => State.IOptionStateBuilder;
  additionalClassName?: string;
}): JSX.Element {
  const render = (r: IOptionBaseRenderProps) => (
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
  return (
    <OptionBase
      store={props.store}
      newBuilder={props.newBuilder}
      defaultState={defaultState()}
      render={render}
      toRow={(x) => <OptionTableRow {...x} />}
    />
  );
}
