import React from "react";
import * as Delay from "../common/Delay";

/** Search box for query visited pages history. */
export function SearchBox(props: {
  onChange: (word: string) => void;
}): JSX.Element {
  const [word, setWord] = React.useState("");
  const debounceDelayMilliSec = 300;
  // debounce search word changes
  Delay.useDebounceEffect(
    () => props.onChange(word),
    [word],
    debounceDelayMilliSec
  );
  return (
    <input
      type="text"
      className="search-box"
      placeholder="word"
      value={word}
      onChange={(e) => setWord(e.target.value)}
      autoFocus
    />
  );
}

export function SearchDuration(props: {
  durationMilliSec: number;
}): JSX.Element {
  const v = Math.ceil(props.durationMilliSec);
  return <label className="search-duration text-mutated">({v} ms)</label>;
}

export function ItemCount(props: { count: number }): JSX.Element {
  return <label className="item-count text-mutated">{props.count} hits</label>;
}
