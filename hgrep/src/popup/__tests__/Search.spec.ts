import * as Search from "@/popup/Search";
import * as API from "@/common/Search";
import * as State from "@/common/State";
import * as Err from "@/common/Error";

describe("Searcher", () => {
  class MockHistorySearcher implements API.IHistorySearcher {
    constructor(private result: API.ISearchResult) {}
    search(
      query: API.ISearchParameter,
      callback: (result: API.ISearchResult) => void
    ): void {
      callback(this.result);
    }
  }
  const defaultConfig: State.IOptionListState = {
    sortType: State.SortType.LastVisitTime,
    queryType: State.QueryType.Raw,
    queryTargetType: State.QueryTargetType.Title,
    queryStartTimeBeforeHour: 24,
    queryMaxResult: 100,
    querySourceMaxResult: 100,
  };
  const searchTests: Array<{
    name: string;
    config: State.IOptionListState;
    word: string;
    source: Array<API.ISearchResultItem>;
    want: Array<string>; // id
    errorType?: string;
  }> = [
    {
      name: "no sources",
      config: defaultConfig,
      word: "",
      source: [],
      want: [],
    },
    {
      name: "ignore no url sources",
      config: defaultConfig,
      word: "one",
      source: [
        {
          id: "1",
          title: "one",
        },
      ],
      want: [],
    },
    {
      name: "hit an item by raw",
      config: defaultConfig,
      word: "one",
      source: [
        {
          id: "1",
          title: "one",
          url: "url1",
        },
      ],
      want: ["1"],
    },
    {
      name: "filter items by raw",
      config: defaultConfig,
      word: "one",
      source: [
        {
          id: "1",
          title: "one",
          url: "url1",
        },
        {
          id: "2",
          title: "two",
          url: "url2",
        },
      ],
      want: ["1"],
    },
    {
      name: "filter items by regexp",
      config: { ...defaultConfig, queryType: State.QueryType.Regex },
      word: "^star",
      source: [
        {
          id: "1",
          title: "stardust",
          url: "url1",
        },
        {
          id: "2",
          title: "poison1",
          url: "url2",
        },
        {
          id: "3",
          title: "starlight",
          url: "url3",
        },
      ],
      want: ["1", "3"],
    },
    {
      name: "filter items by url",
      config: { ...defaultConfig, queryTargetType: State.QueryTargetType.Url },
      word: "music",
      source: [
        {
          id: "1",
          title: "all right",
          url: "music1",
        },
        {
          id: "2",
          title: "no music no life",
          url: "robot",
        },
        {
          id: "3",
          title: "hack music",
          url: "music3",
        },
      ],
      want: ["1", "3"],
    },
    {
      name: "limit by max result items",
      config: { ...defaultConfig, queryMaxResult: 1 },
      word: "music",
      source: [
        {
          id: "1",
          title: "no music no life",
          url: "url1",
        },
        {
          id: "2",
          title: "hack music",
          url: "url2",
        },
      ],
      want: ["1"],
    },
    {
      name: "sort by last visit time",
      config: { ...defaultConfig, queryTargetType: State.QueryTargetType.Url },
      word: "wood",
      source: [
        {
          id: "100",
          url: "wood",
          lastVisitTime: 100,
        },
        {
          id: "latest",
          url: "wood",
          lastVisitTime: 1000,
        },
        {
          id: "200",
          url: "wood",
          lastVisitTime: 200,
        },
        {
          id: "undefined",
          url: "wood",
        },
        {
          id: "300",
          url: "wood",
          lastVisitTime: 300,
        },
      ],
      want: ["latest", "300", "200", "100", "undefined"],
    },
    {
      name: "sort by visit count",
      config: {
        ...defaultConfig,
        queryTargetType: State.QueryTargetType.Url,
        sortType: State.SortType.VisitCount,
      },
      word: "wood",
      source: [
        {
          id: "100",
          url: "wood",
          visitCount: 100,
        },
        {
          id: "most",
          url: "wood",
          visitCount: 1000,
        },
        {
          id: "200",
          url: "wood",
          visitCount: 200,
        },
        {
          id: "undefined",
          url: "wood",
        },
        {
          id: "300",
          url: "wood",
          visitCount: 300,
        },
      ],
      want: ["most", "300", "200", "100", "undefined"],
    },
    {
      name: "invalid regexp",
      config: { ...defaultConfig, queryType: State.QueryType.Regex },
      word: "(",
      source: [],
      want: [],
      errorType: "RegExpSyntaxError",
    },
    {
      name: "glob not implemented yet",
      config: { ...defaultConfig, queryType: State.QueryType.Glob },
      word: "glob",
      source: [],
      want: [],
      errorType: "NotImplementedError",
    },
  ];
  for (const { name, config, word, source, want, errorType } of searchTests) {
    it(name, () => {
      const m = new MockHistorySearcher({ items: source });
      const s = new Search.Searcher(m, config);
      try {
        s.search(word, (result) => {
          expect(result.items.map((x) => x.id)).toEqual(want);
        });
      } catch (e) {
        expect(e instanceof Err.BaseError).toBeTruthy();
        expect(e.constructor.name).toBe(errorType);
      }
    });
  }
});
