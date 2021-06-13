import React, { useEffect } from "react";
import * as State from "../common/State";

/**
 * Creates selections from a dictionary.
 * A key is a text, a value is a value of an option.
 * @param props `id` is id of select
 */
function SelectItems<T>(props: { id: string; items: { [key: string]: T } }) {
  const options = Object.entries(props.items).map(([k, v]) => (
    <option key={k} value={String(v)}>
      {k}
    </option>
  ));
  return (
    <select id={props.id} key={props.id} className="options-select-items">
      {options}
    </select>
  );
}

interface IOptionsProps {
  storage: State.IOptionListStateStorage;
  newBuilder: () => State.IOptionListStateBuilder;
}

interface IOptionsState {
  sortType: State.SortType;
  queryType: State.QueryType;
  queryTargetType: State.QueryTargetType;
}

const tags = {
  sortType: "sort-type",
  queryType: "query-type",
  queryTargetType: "query-target-type",
  saveButton: "save-options",
} as const;

/** Reads options from DOM. */
function getOptions(
  newBuilder: () => State.IOptionListStateBuilder
): IOptionsState {
  const b = newBuilder();
  {
    const x = document.getElementById(tags.sortType) as HTMLSelectElement;
    b.sortType(x.value);
  }
  {
    const x = document.getElementById(tags.queryType) as HTMLSelectElement;
    b.queryType(x.value);
  }
  {
    const x = document.getElementById(
      tags.queryTargetType
    ) as HTMLSelectElement;
    b.queryTargetType(x.value);
  }
  const r = b.build();
  return {
    sortType: r.sortType,
    queryType: r.queryType,
    queryTargetType: r.queryTargetType,
  };
}

/** Reflects options into DOM. */
function setOptions(state: IOptionsState) {
  {
    const x = document.getElementById(tags.sortType) as HTMLSelectElement;
    x.value = String(state.sortType);
  }
  {
    const x = document.getElementById(tags.queryType) as HTMLSelectElement;
    x.value = String(state.queryType);
  }
  {
    const x = document.getElementById(
      tags.queryTargetType
    ) as HTMLSelectElement;
    x.value = String(state.queryTargetType);
  }
}

/** Prepares initial values, event listeners. */
function setupOptions(
  storage: State.IOptionListStateStorage,
  newBuilder: () => State.IOptionListStateBuilder
) {
  storage.read(setOptions);
  const x = document.getElementById(tags.saveButton) as HTMLButtonElement;
  x.addEventListener("click", () => {
    const state = getOptions(newBuilder);
    const next = newBuilder()
      .sortType(String(state.sortType))
      .queryType(String(state.queryType))
      .queryTargetType(String(state.queryTargetType))
      .build();
    storage.update(next, [
      State.OptionKey.SortType,
      State.OptionKey.QueryType,
      State.OptionKey.QueryTagetType,
    ]);
  });
}

/** Lightweight setting panel. */
export function Options(props: IOptionsProps) {
  const items = {
    "Sort Type": <SelectItems id={tags.sortType} items={State.SortType} />,
    "Query Type": <SelectItems id={tags.queryType} items={State.QueryType} />,
    "Query Target Type": (
      <SelectItems id={tags.queryTargetType} items={State.QueryTargetType} />
    ),
  };
  const saveButton = (
    <button id={tags.saveButton} className="btn btn-success">
      Save
    </button>
  );
  const rows = Object.entries(items).map(([k, v]) => (
    <tr className="options-table-row" key={k}>
      <td>{k}</td>
      <td>{v}</td>
    </tr>
  ));
  // prepare event listeners and initial values after rendering
  useEffect(() => setupOptions(props.storage, props.newBuilder));

  return (
    <div className="container-fluid">
      <table className="row table table-sm options-table">
        <tbody>{rows}</tbody>
      </table>
      <div className="row">{saveButton}</div>
    </div>
  );
}
