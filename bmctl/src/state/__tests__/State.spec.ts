import * as State from "../State";
import * as Search from "../../bookmarks/Search";
import * as Func from "../../common/Function";

describe("toNumberoptional", () => {
  const tests = [
    {
      name: "undefined into none",
      value: undefined,
      want: {
        ok: true,
        value: Func.None,
      },
    },
    {
      name: "number",
      value: 10,
      want: {
        ok: true,
        value: {
          ok: true,
          value: 10,
        },
      },
    },
    {
      name: "string",
      value: "10",
      want: {
        ok: true,
        value: {
          ok: true,
          value: 10,
        },
      },
    },
    {
      name: "none to none",
      value: Func.None,
      want: {
        ok: true,
        value: Func.None,
      },
    },
    {
      name: "some of number",
      value: {
        ok: true,
        value: 10,
      },
      want: {
        ok: true,
        value: {
          ok: true,
          value: 10,
        },
      },
    },
    {
      name: "some of string",
      value: {
        ok: true,
        value: "10",
      },
      want: {
        ok: true,
        value: {
          ok: true,
          value: 10,
        },
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      expect(State.toNumberOptional(value)).toEqual(want);
    });
  }
});

describe("toQueryType", () => {
  const tests = [
    {
      name: "identity",
      value: Search.QueryType.Raw,
      want: {
        ok: true,
        value: Search.QueryType.Raw,
      },
    },
    {
      name: "accept string",
      value: "raw",
      want: {
        ok: true,
        value: Search.QueryType.Raw,
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      expect(State.toQueryType(value)).toEqual(want);
    });
  }
  it("reject string", () => {
    const got = State.toQueryType("fire");
    expect(got.ok).toBeFalsy();
    expect(got.value.constructor.name).toEqual("InvalidQueryTypeError");
  });
});

describe("toQueryTargetType", () => {
  const tests = [
    {
      name: "identity",
      value: Search.QueryTargetType.Url,
      want: {
        ok: true,
        value: Search.QueryTargetType.Url,
      },
    },
    {
      name: "accept string",
      value: "url",
      want: {
        ok: true,
        value: Search.QueryTargetType.Url,
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      expect(State.toQueryTargetType(value)).toEqual(want);
    });
  }
  it("reject string", () => {
    const got = State.toQueryTargetType("ice");
    expect(got.ok).toBeFalsy();
    expect(got.value.constructor.name).toEqual("InvalidQueryTargetTypeError");
  });
});

describe("toSortType", () => {
  const tests = [
    {
      name: "identity",
      value: Search.SortType.Url,
      want: {
        ok: true,
        value: Search.SortType.Url,
      },
    },
    {
      name: "accept string",
      value: "url",
      want: {
        ok: true,
        value: Search.SortType.Url,
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      expect(State.toSortType(value)).toEqual(want);
    });
  }
  it("reject string", () => {
    const got = State.toSortType("wind");
    expect(got.ok).toBeFalsy();
    expect(got.value.constructor.name).toEqual("InvalidSortTypeError");
  });
});

describe("toSortOrderType", () => {
  const tests = [
    {
      name: "identity",
      value: Search.SortOrderType.Desc,
      want: {
        ok: true,
        value: Search.SortOrderType.Desc,
      },
    },
    {
      name: "accept string",
      value: "desc",
      want: {
        ok: true,
        value: Search.SortOrderType.Desc,
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      expect(State.toSortOrderType(value)).toEqual(want);
    });
  }
  it("reject string", () => {
    const got = State.toSortOrderType("earth");
    expect(got.ok).toBeFalsy();
    expect(got.value.constructor.name).toEqual("InvalidSortOrderTypeError");
  });
});

describe("toFilterType", () => {
  const tests = [
    {
      name: "identity",
      value: {
        kind: "before",
        timestamp: 10,
      },
      want: {
        ok: true,
        value: {
          kind: "before",
          timestamp: 10,
        },
      },
    },
    {
      name: "accept string timestamp",
      value: {
        kind: "after",
        timestamp: "10",
      },
      want: {
        ok: true,
        value: {
          kind: "after",
          timestamp: 10,
        },
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      expect(State.toFilterType(value)).toEqual(want);
    });
  }
  const failures = [
    {
      name: "reject due to invalid kind",
      value: {
        kind: "egg",
        timestamp: 10,
      },
    },
    {
      name: "reject due to invalid type",
      value: "filter",
    },
  ];
  for (const { name, value } of failures) {
    it(name, () => {
      const got = State.toFilterType(value);
      expect(got.ok).toBeFalsy();
      expect(got.value.constructor.name).toEqual("InvalidFilterTypeError");
    });
  }
});

describe("IOptionStateBuilder", () => {
  const defaultNative = {
    queryType: Search.QueryType.Raw,
    queryTargetType: Search.QueryTargetType.Title,
    sortType: Search.SortType.Timestamp,
    sortOrderType: Search.SortOrderType.Desc,
    filters: [],
    queryMaxResult: Func.None,
    querySourceMaxResult: Func.None,
  };
  const raw = {
    queryType: "regex",
    queryTargetType: "url",
    sortType: "url",
    sortOrderType: "asc",
    filters: [
      {
        kind: "after",
        timestamp: 1,
      },
    ],
    queryMaxResult: {
      ok: true,
      value: 2,
    },
    querySourceMaxResult: {
      ok: true,
      value: 3,
    },
  };
  const native = {
    queryType: Search.QueryType.Regex,
    queryTargetType: Search.QueryTargetType.Url,
    sortType: Search.SortType.Url,
    sortOrderType: Search.SortOrderType.Asc,
    filters: [
      {
        kind: "after",
        timestamp: 1,
      },
    ],
    queryMaxResult: {
      ok: true,
      value: 2,
    },
    querySourceMaxResult: {
      ok: true,
      value: 3,
    },
  };
  it("default build", () => {
    expect(State.newIOptionStateBuilder().build()).toEqual(defaultNative);
  });
  it("fromObject", () => {
    expect(State.newIOptionStateBuilder().fromObject(raw).build()).toEqual(
      native
    );
  });
  it("build", () => {
    const x = State.newIOptionStateBuilder()
      .queryType("regex")
      .queryTargetType("url")
      .sortType("url")
      .sortOrderType("asc")
      .addFilter({
        kind: "after",
        timestamp: 1,
      })
      .queryMaxResult(2)
      .querySourceMaxResult(3)
      .build();
    expect(x).toEqual(native);
  });
  it("add filters", () => {
    const x = State.newIOptionStateBuilder()
      .addFilter({
        kind: "after",
        timestamp: 1,
      })
      .addFilter({
        kind: "before",
        timestamp: 2,
      })
      .build();
    expect(x.filters).toEqual([
      {
        kind: "after",
        timestamp: 1,
      },
      {
        kind: "before",
        timestamp: 2,
      },
    ]);
  });
  it("set filters", () => {
    const x = State.newIOptionStateBuilder().filters([
      {
        kind: "after",
        timestamp: 1,
      },
      {
        kind: "before",
        timestamp: 2,
      },
    ]);
    expect(x.build().filters).toEqual([
      {
        kind: "after",
        timestamp: 1,
      },
      {
        kind: "before",
        timestamp: 2,
      },
    ]);
    x.filters([]);
    expect(x.build().filters.length).toBe(0);
  });
});
