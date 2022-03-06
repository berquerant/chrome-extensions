import * as Search from "@/bookmarks/Search";
import * as Common from "@/bookmarks/Common";
import * as Read from "@/bookmarks/Read";
import { IFuzzySearcher } from "@/common/Search";

describe("ISearcher", () => {
  class MockScanner implements Read.IScanner {
    private d: Common.INodeMap;
    constructor(nl: Common.INodeList) {
      this.d = Common.nodeListToMap(nl);
    }
    async scan(): Promise<Common.INodeMap> {
      return this.d;
    }
  }
  class MockFuzzySearcher implements IFuzzySearcher {
    search<T>(list: Array<T>, _: string): Array<T> {
      return list;
    }
  }
  const baseTS = 1624151290;
  const w = "word";
  const q = {
    word: w,
    queryType: Search.QueryType.Raw,
    queryTargetType: Search.QueryTargetType.Title,
    sortType: Search.SortType.Timestamp,
    sortOrderType: Search.SortOrderType.Desc,
    filters: [],
  };
  const tests: Array<{
    name: string;
    src: Common.INodeList;
    query: Search.IQuery;
    want: Array<Common.NodeId>;
  }> = [
    {
      name: "empty source",
      src: [],
      query: q,
      want: [],
    },
    {
      name: "no hits by raw",
      src: [
        {
          id: "1",
          info: {
            title: "t1",
          },
        },
      ],
      query: q,
      want: [],
    },
    {
      name: "hit by raw",
      src: [
        {
          id: "1",
          info: {
            title: w,
          },
        },
        {
          id: "2",
          info: {
            title: "t2",
          },
        },
      ],
      query: q,
      want: ["1"],
    },
    {
      name: "hit by regex",
      src: [
        {
          id: "1",
          info: {
            title: `${w}1`,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "2",
          info: {
            title: `${w}2`,
            dateAdded: (baseTS + 1) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: "t3",
          },
        },
      ],
      query: { ...q, queryType: Search.QueryType.Regex },
      want: ["1", "2"],
    },
    {
      name: "hit by url",
      src: [
        {
          id: "1",
          info: {
            title: "t1",
          },
        },
        {
          id: "2",
          info: {
            title: "t2",
            url: "u2",
          },
        },
        {
          id: "3",
          info: {
            title: "t3",
            url: `u${w}`,
          },
        },
      ],
      query: { ...q, queryTargetType: Search.QueryTargetType.Url },
      want: ["3"],
    },
    {
      name: "sort by timestamp desc",
      src: [
        {
          id: "2",
          info: {
            title: `${w}1`,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "1",
          info: {
            title: `${w}2`,
            dateAdded: (baseTS + 20) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: `${w}3`,
          },
        },
      ],
      query: q,
      want: ["1", "2", "3"],
    },
    {
      name: "sort by timestamp asc",
      src: [
        {
          id: "2",
          info: {
            title: `${w}2`,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "1",
          info: {
            title: `${w}2`,
            dateAdded: (baseTS + 20) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: `${w}3`,
          },
        },
      ],
      query: { ...q, sortOrderType: Search.SortOrderType.Asc },
      want: ["3", "2", "1"],
    },
    {
      name: "sort by title asc",
      src: [
        {
          id: "2",
          info: {
            title: `${w}2`,
          },
        },
        {
          id: "1",
          info: {
            title: `${w}1`,
          },
        },
        {
          id: "3",
          info: {
            title: `${w}3`,
          },
        },
      ],
      query: {
        ...q,
        sortType: Search.SortType.Title,
        sortOrderType: Search.SortOrderType.Asc,
      },
      want: ["1", "2", "3"],
    },
    {
      name: "sort by url asc",
      src: [
        {
          id: "2",
          info: {
            title: `${w}3`,
            url: "url2",
          },
        },
        {
          id: "1",
          info: {
            title: `${w}2`,
            url: "url1",
          },
        },
        {
          id: "3",
          info: {
            title: `${w}1`,
            url: "url3",
          },
        },
        {
          id: "0",
          info: {
            title: `${w}0`,
          },
        },
      ],
      query: {
        ...q,
        sortType: Search.SortType.Url,
        sortOrderType: Search.SortOrderType.Asc,
      },
      want: ["0", "1", "2", "3"],
    },
    {
      name: "before filter",
      src: [
        {
          id: "2",
          info: {
            title: w,
          },
        },
        {
          id: "1",
          info: {
            title: w,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: w,
            dateAdded: (baseTS + 20) * 1000,
          },
        },
      ],
      query: { ...q, filters: [{ kind: "before", timestamp: baseTS + 15 }] },
      want: ["1", "2"],
    },
    {
      name: "after filter",
      src: [
        {
          id: "2",
          info: {
            title: w,
          },
        },
        {
          id: "1",
          info: {
            title: w,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: w,
            dateAdded: (baseTS + 20) * 1000,
          },
        },
      ],
      query: { ...q, filters: [{ kind: "after", timestamp: baseTS + 10 }] },
      want: ["3", "1"],
    },
    {
      name: "timerange filter",
      src: [
        {
          id: "0",
          info: {
            title: w,
          },
        },
        {
          id: "1",
          info: {
            title: w,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "2",
          info: {
            title: w,
            dateAdded: (baseTS + 20) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: w,
            dateAdded: (baseTS + 30) * 1000,
          },
        },
        {
          id: "4",
          info: {
            title: w,
            dateAdded: (baseTS + 40) * 1000,
          },
        },
      ],
      query: {
        ...q,
        filters: [
          { kind: "after", timestamp: baseTS + 15 },
          { kind: "before", timestamp: baseTS + 35 },
        ],
      },
      want: ["3", "2"],
    },
    {
      name: "limited query source",
      src: [
        {
          id: "1",
          info: {
            title: w,
          },
        },
        {
          id: "2",
          info: {
            title: "t2",
          },
        },
        {
          id: "3",
          info: {
            title: w,
          },
        },
      ],
      query: { ...q, querySourceMaxResult: 2 },
      want: ["1"],
    },
    {
      name: "limited query result",
      src: [
        {
          id: "1",
          info: {
            title: w,
            dateAdded: (baseTS + 10) * 1000,
          },
        },
        {
          id: "2",
          info: {
            title: "t2",
          },
        },
        {
          id: "4",
          info: {
            title: w,
            dateAdded: (baseTS + 40) * 1000,
          },
        },
        {
          id: "3",
          info: {
            title: w,
            dateAdded: (baseTS + 30) * 1000,
          },
        },
      ],
      query: { ...q, queryMaxResult: 2 },
      want: ["4", "3"],
    },
  ];
  for (const { name, src, query, want } of tests) {
    it(name, async () => {
      const s = Search.newISearcher(
        new MockScanner(src),
        new MockFuzzySearcher()
      );
      const g = await s.search(query);
      expect(g.map((x) => x.id)).toEqual(want);
    });
  }
});
