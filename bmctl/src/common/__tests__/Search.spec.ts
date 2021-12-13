import * as Search from "../Search";

describe("FuzzySearcher", () => {
  type Doc = {
    id: number;
    title: string;
    detail: {
      content: string;
    };
  };
  const docs: Array<Doc> = [
    {
      id: 1,
      title: "finder",
      detail: {
        content: "folder red",
      },
    },
    {
      id: 2,
      title: "starter",
      detail: {
        content: "blue",
      },
    },
    {
      id: 3,
      title: "vacation",
      detail: {
        content: "orphan",
      },
    },
    {
      id: 4,
      title: "finder starter",
      detail: {
        content: "green orphan",
      },
    },
    {
      id: 5,
      title: "stopper",
      detail: {
        content: "finder",
      },
    },
  ];
  const wholeDocs = docs.map((x) => x.id);
  const tests = [
    {
      name: "empty pattern",
      keys: ["title"],
      pattern: "",
      want: wholeDocs,
    },
    {
      name: "no keys",
      keys: [],
      pattern: "pattern",
      want: wholeDocs,
    },
    {
      name: "search title",
      keys: ["title"],
      pattern: "finder",
      want: [1, 4],
    },
    {
      name: "search content",
      keys: ["detail.content"],
      pattern: "green",
      want: [4],
    },
    {
      name: "search content and",
      keys: ["detail.content"],
      pattern: "red fold",
      want: [1],
    },
    {
      name: "search title and content",
      keys: ["title", "detail.content"],
      pattern: "finder",
      want: [1, 4, 5],
    },
  ];
  for (const { name, keys, pattern, want } of tests) {
    test(name, () => {
      const s = Search.newIFuzzySearcher(keys);
      const r = s.search(docs, pattern);
      const got = r.map((x) => x.id).sort();
      expect(want.sort()).toEqual(got);
    });
  }
});
