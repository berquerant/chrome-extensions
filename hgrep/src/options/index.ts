import * as State from "../common/State";
import "./Options.scss";

const tags = {
  sortType: "sort-type",
  queryType: "query-type",
  queryTargetType: "query-target-type",
  queryStartTimeBeforeHour: "query-start-time-before-hour",
  queryMaxResult: "query-max-result",
  querySourceMaxResult: "query-source-max-result",
  saveButton: "save-options",
} as const;

/** Reads options from DOM. */
function getOptions(
  newBuilder: () => State.IOptionListStateBuilder
): State.IOptionListState {
  const b = newBuilder();
  document.getElementsByName(tags.sortType).forEach((x: HTMLInputElement) => {
    if (x.checked) {
      b.sortType(x.value);
    }
  });
  document.getElementsByName(tags.queryType).forEach((x: HTMLInputElement) => {
    if (x.checked) {
      b.queryType(x.value);
    }
  });
  document
    .getElementsByName(tags.queryTargetType)
    .forEach((x: HTMLInputElement) => {
      if (x.checked) {
        b.queryTargetType(x.value);
      }
    });
  {
    const x = document.getElementById(
      tags.queryStartTimeBeforeHour
    ) as HTMLInputElement;
    b.queryStartTimeBeforeHour(x.value);
  }
  {
    const x = document.getElementById(tags.queryMaxResult) as HTMLInputElement;
    b.queryMaxResult(x.value);
  }
  {
    const x = document.getElementById(
      tags.querySourceMaxResult
    ) as HTMLInputElement;
    b.querySourceMaxResult(x.value);
  }
  return b.build();
}

/** Reflects the state into DOM. */
function setOptions(state: State.IOptionListState) {
  const s = state;
  document.getElementsByName(tags.sortType).forEach((x: HTMLInputElement) => {
    x.checked = x.value == String(s.sortType);
  });
  document.getElementsByName(tags.queryType).forEach((x: HTMLInputElement) => {
    x.checked = x.value == String(s.queryType);
  });
  document
    .getElementsByName(tags.queryTargetType)
    .forEach((x: HTMLInputElement) => {
      x.checked = x.value == String(s.queryTargetType);
    });
  {
    const x = document.getElementById(
      tags.queryStartTimeBeforeHour
    ) as HTMLInputElement;
    x.value = String(s.queryStartTimeBeforeHour);
  }
  {
    const x = document.getElementById(tags.queryMaxResult) as HTMLInputElement;
    x.value = String(s.queryMaxResult);
  }
  {
    const x = document.getElementById(
      tags.querySourceMaxResult
    ) as HTMLInputElement;
    x.value = String(s.querySourceMaxResult);
  }
}

/** Prepares initial values, event listeners. */
function setupOptions(
  storage: State.IOptionListStateStorage,
  newBuilder: () => State.IOptionListStateBuilder
) {
  storage.read(setOptions);
  const x = document.getElementById(tags.saveButton) as HTMLButtonElement;
  x.addEventListener("click", () => storage.write(getOptions(newBuilder)));
}

chrome.tabs.query({ active: true, currentWindow: true }, (_) =>
  setupOptions(
    new State.OptionListStateStorage(
      () => new State.OptionListStateBuilder(),
      () => new State.OptionListStateFlattener(),
      new State.LocalStorageArea()
    ),
    () => new State.OptionListStateBuilder()
  )
);
