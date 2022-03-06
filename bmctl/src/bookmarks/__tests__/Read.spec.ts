import * as Native from "@/bookmarks/Native";
import * as Read from "@/bookmarks/Read";

describe("IScanner", () => {
  class MockBookmarksAPI implements Native.IBookmarksAPI {
    constructor(private bookmarks: Array<Native.INode>) {}
    remove(id: string): Promise<void> {
      throw new Error("Method not implemented.");
    }
    get(ids: Array<string>): Promise<Array<Native.INode>> {
      throw new Error("Method not implemented.");
    }
    create(node: Native.ICreateNode): Promise<Native.INode> {
      throw new Error("Method not implemented.");
    }
    getTree(): Promise<Array<Native.INode>> {
      return new Promise((resolve) => resolve(this.bookmarks));
    }
  }

  const tests = [
    {
      name: "empty source",
      source: [],
      want: [],
    },
    {
      name: "an item",
      source: [
        {
          id: "1",
          title: "t1",
        },
      ],
      want: ["1"],
    },
    {
      name: "branch",
      source: [
        {
          id: "1",
          title: "t1",
        },
        {
          id: "2",
          title: "t2",
          children: [
            {
              id: "3",
              title: "t3",
            },
            {
              id: "4",
              title: "t4",
              children: [
                {
                  id: "5",
                  title: "t5",
                },
              ],
            },
          ],
        },
      ],
      want: ["1", "2", "3", "4", "5"],
    },
  ];

  for (const { name, source, want } of tests) {
    it(name, async () => {
      const m = new MockBookmarksAPI(source);
      const s = Read.newIScanner(m);
      const got = await s.scan();
      expect(
        Array.from(got.values())
          .map((x) => x.id)
          .sort()
      ).toEqual(want);
    });
  }
});
