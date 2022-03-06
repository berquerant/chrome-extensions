import * as State from "@/common/State";

describe("OptionListStateBuilder", () => {
  const newBuilder = () => new State.OptionListStateBuilder();
  it("build a default deliverable", () => {
    expect(newBuilder().build()).toEqual({
      sortType: State.SortType.LastVisitTime,
      queryType: State.QueryType.Raw,
      queryTargetType: State.QueryTargetType.Title,
      queryStartTimeBeforeHour: 24,
      queryMaxResult: 100,
      querySourceMaxResult: 100,
    });
  });
  it("build a deliverable with validated values", () => {
    expect(
      newBuilder()
        .sortType("NOOP")
        .queryType("regex")
        .queryMaxResult("1000")
        .queryStartTimeBeforeHour("-1")
        .build()
    ).toEqual({
      sortType: State.SortType.LastVisitTime,
      queryType: State.QueryType.Regex,
      queryTargetType: State.QueryTargetType.Title,
      queryStartTimeBeforeHour: 24,
      queryMaxResult: 1000,
      querySourceMaxResult: 100,
    });
  });
});

describe("OptionListStateFlattener", () => {
  const newFlattener = () => new State.OptionListStateFlattener();
  it("flatten a state", () => {
    expect(
      newFlattener().flatten({
        sortType: State.SortType.LastVisitTime,
        queryType: State.QueryType.Raw,
        queryTargetType: State.QueryTargetType.Title,
        queryStartTimeBeforeHour: 24,
        queryMaxResult: 100,
        querySourceMaxResult: 100,
      })
    ).toEqual({
      sortType: "lastVisitTime",
      queryType: "raw",
      queryTargetType: "title",
      queryStartTimeBeforeHour: "24",
      queryMaxResult: "100",
      querySourceMaxResult: "100",
    });
  });
});

describe("OptionListStateStorage", () => {
  // not a unit test
  class MockStorageArea implements State.IStorageArea {
    constructor(public d: { [key: string]: string }) {}
    get(
      callback: (items: { [key: string]: string }) => void,
      keys?: Array<string>
    ): void {
      const ks = () => {
        if (!keys) {
          return Object.keys(this.d);
        }
        return keys;
      };
      const d = {} as { [key: string]: string };
      ks()
        .filter((k) => k in this.d)
        .forEach((k) => (d[k] = this.d[k]));
      callback(d);
    }
    set(items: { string: string }): void {
      Object.entries(items).forEach(([k, v]) => (this.d[k] = v));
    }
  }
  const newStorage = (sa: State.IStorageArea) =>
    new State.OptionListStateStorage(
      () => new State.OptionListStateBuilder(),
      () => new State.OptionListStateFlattener(),
      sa
    );
  const d = {
    sortType: "visitCount",
    queryType: "glob",
    queryTargetType: "title",
    queryStartTimeBeforeHour: "48",
    queryMaxResult: "1000",
    querySourceMaxResult: "10",
  } as { [key: string]: string };
  const w = {
    sortType: State.SortType.VisitCount,
    queryType: State.QueryType.Glob,
    queryTargetType: State.QueryTargetType.Title,
    queryStartTimeBeforeHour: 48,
    queryMaxResult: 1000,
    querySourceMaxResult: 10,
  } as State.IOptionListState;

  it("read state", () => {
    const s = newStorage(new MockStorageArea({ ...d }));
    s.read((state) => expect(state).toEqual(w));
  });

  it("write state", () => {
    const m = new MockStorageArea({ ...d });
    const s = newStorage(m);
    s.write({ ...w, queryMaxResult: 1 });
    expect(m.d).toEqual({ ...d, queryMaxResult: "1" });
  });

  it("read and write state", () => {
    const g = { ...w, sortType: State.SortType.LastVisitTime };
    const s = newStorage(new MockStorageArea({ ...d }));
    s.write(g);
    s.read((state) => expect(state).toEqual(g));
  });

  const updateTests = [
    {
      name: "no updates",
      before: { ...d },
      state: {
        ...w,
        sortType: State.SortType.LastVisitTime,
        queryMaxResult: 1,
      },
      keys: [],
      want: { ...d },
    },
    {
      name: "update records but keys are limited",
      before: { ...d },
      state: {
        ...w,
        sortType: State.SortType.LastVisitTime,
        queryMaxResult: 1,
      },
      keys: [State.OptionKey.QueryMaxResult],
      want: { ...d, queryMaxResult: "1" },
    },
    {
      name: "update all records",
      before: { ...d },
      state: {
        ...w,
        sortType: State.SortType.LastVisitTime,
        queryMaxResult: 1,
      },
      keys: Object.values(State.OptionKey),
      want: {
        ...d,
        sortType: String(State.SortType.LastVisitTime),
        queryMaxResult: "1",
      },
    },
  ];
  for (const { name, before, state, keys, want } of updateTests) {
    it(name, () => {
      const m = new MockStorageArea(before);
      const s = newStorage(m);
      s.update(state, keys);
      expect(m.d).toEqual(want);
    });
  }
});
