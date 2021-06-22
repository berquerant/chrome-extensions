import * as StateStorage from "../StateStorage";
import * as Storage from "../Storage";
import * as State from "../../state/State";
import * as Search from "../../bookmarks/Search";
import * as Func from "../../common/Function";

describe("IOptionStateStorage", () => {
  // not unit test
  class MockOptionStorage implements Storage.IStorageArea {
    constructor(public d: Record<string, unknown>) {}
    async get(keys?: Array<string>): Promise<Record<string, unknown>> {
      return this.d;
    }
    async set(items: Record<string, unknown>): Promise<void> {
      this.d = items;
    }
  }

  it("read state", async () => {
    const m = new MockOptionStorage({
      queryType: "regex",
      queryTargetType: "title",
      sortType: "url",
      sortOrderType: "asc",
      filters: [],
      queryMaxResult: Func.None,
      querySourceMaxResult: Func.None,
    });
    const s = StateStorage.newIOptionStateStorage(
      m,
      State.newIOptionStateBuilder
    );
    const got = await s.read();
    expect(got).toEqual({
      queryType: Search.QueryType.Regex,
      queryTargetType: Search.QueryTargetType.Title,
      sortType: Search.SortType.Url,
      sortOrderType: Search.SortOrderType.Asc,
      filters: [],
      queryMaxResult: Func.None,
      querySourceMaxResult: Func.None,
    });
  });
  it("write state", async () => {
    const m = new MockOptionStorage({
      queryType: "raw",
      queryTargetType: "title",
      sortType: "title",
      sortOrderType: "desc",
      filters: [],
      queryMaxResult: Func.None,
      querySourceMaxResult: Func.None,
    });
    const s = StateStorage.newIOptionStateStorage(
      m,
      State.newIOptionStateBuilder
    );
    await s.write({
      queryType: Search.QueryType.Regex,
      queryTargetType: Search.QueryTargetType.Url,
      sortType: Search.SortType.Url,
      sortOrderType: Search.SortOrderType.Asc,
      filters: [],
      queryMaxResult: Func.None,
      querySourceMaxResult: Func.None,
    });
    expect(m.d).toEqual({
      queryType: "regex",
      queryTargetType: "url",
      sortType: "url",
      sortOrderType: "asc",
      filters: [],
      queryMaxResult: Func.None,
      querySourceMaxResult: Func.None,
    });
  });
  it("update state", async () => {
    const m = new MockOptionStorage({
      queryType: "regex",
      queryTargetType: "url",
      sortType: "url",
      sortOrderType: "asc",
      filters: [],
      queryMaxResult: Func.None,
      querySourceMaxResult: Func.None,
    });
    const s = StateStorage.newIOptionStateStorage(
      m,
      State.newIOptionStateBuilder
    );
    await s.update(
      {
        queryType: Search.QueryType.Raw,
        queryTargetType: Search.QueryTargetType.Title,
        sortType: Search.SortType.Title,
        sortOrderType: Search.SortOrderType.Desc,
        filters: [
          {
            kind: "after",
            timestamp: 10,
          },
        ],
        queryMaxResult: Func.Some(1000),
        querySourceMaxResult: Func.None,
      },
      [
        State.OptionStateKey.QueryTargetType,
        State.OptionStateKey.SortType,
        State.OptionStateKey.Filters,
        State.OptionStateKey.QueryMaxResult,
        State.OptionStateKey.QuerySourceMaxResult,
      ]
    );
    expect(m.d).toEqual({
      queryType: "regex",
      queryTargetType: "title",
      sortType: "title",
      sortOrderType: "asc",
      filters: [
        {
          kind: "after",
          timestamp: 10,
        },
      ],
      queryMaxResult: Func.Some(1000),
      querySourceMaxResult: Func.None,
    });
  });
});
