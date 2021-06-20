import * as Native from "../Native";
import * as Read from "../Read";

describe("IScanner", () => {
  class MockBookmarksAPI implements Native.IBookmarksAPI {
    constructor(private bookmarks: Array<Native.INode>) {}
    remove(id: string): Promise<void> {
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
