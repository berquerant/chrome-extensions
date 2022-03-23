import * as Folder from "@/bookmarks/Folder";
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
  const tests: Array<{
    name: string;
    src: Common.INodeList;
    want: Array<{
      id: Common.NodeId;
      absPath: string;
    }>;
  }> = [
    {
      name: "empty source",
      src: [],
      want: [],
    },
    {
      name: "root",
      src: [
        {
          id: "0",
          info: {
            title: "",
            path: Common.newIPath([]),
          },
        },
      ],
      want: [
        {
          id: "0",
          absPath: "/",
        },
      ],
    },
    {
      name: "folder",
      src: [
        {
          id: "0",
          info: {
            title: "",
            path: Common.newIPath([]),
          },
        },
        {
          id: "1",
          parentId: "0",
          info: {
            title: "f1",
            path: Common.newIPath(["f1"]),
          },
        },
      ],
      want: [
        {
          id: "0",
          absPath: "/",
        },
        {
          id: "1",
          absPath: "/f1",
        },
      ],
    },
    {
      name: "nested folder",
      src: [
        {
          id: "0",
          info: {
            title: "",
            path: Common.newIPath([]),
          },
        },
        {
          id: "1",
          parentId: "0",
          info: {
            title: "f1",
            path: Common.newIPath(["f1"]),
          },
        },
        {
          id: "2",
          parentId: "1",
          info: {
            title: "f2",
            path: Common.newIPath(["f1", "f2"]),
          },
        },
      ],
      want: [
        {
          id: "0",
          absPath: "/",
        },
        {
          id: "1",
          absPath: "/f1",
        },
        {
          id: "2",
          absPath: "/f1/f2",
        },
      ],
    },
    {
      name: "folders and a leaf",
      src: [
        {
          id: "0",
          info: {
            title: "",
            path: Common.newIPath([]),
          },
        },
        {
          id: "1",
          parentId: "0",
          info: {
            title: "f1",
            path: Common.newIPath(["f1"]),
          },
        },
        {
          id: "2",
          parentId: "0",
          info: {
            title: "f2",
            path: Common.newIPath(["f2"]),
          },
        },
        {
          id: "3",
          parentId: "1",
          info: {
            title: "e1",
            path: Common.newIPath(["f1", "e1"]),
            url: "e1-url",
          },
        },
      ],
      want: [
        {
          id: "0",
          absPath: "/",
        },
        {
          id: "1",
          absPath: "/f1",
        },
        {
          id: "2",
          absPath: "/f2",
        },
      ],
    },
  ];
  for (const { name, src, want } of tests) {
    it(name, async () => {
      const s = Folder.newISearcher(
        new MockScanner(src),
        new MockFuzzySearcher()
      );
      const got = await s.search({
        word: "word",
      });
      expect(
        got.map((x) => ({
          id: x.id,
          absPath: x.info.path.str,
        }))
      ).toEqual(want);
    });
  }
});
