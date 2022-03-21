import * as Common from "@/bookmarks/Common";
import { None, Ok } from "@/common/Function";

describe("INodeMap", () => {
  it("satisfy scenario", () => {
    const d = Common.newINodeMap();
    expect(d.size()).toBe(0);
    d.set({
      id: "1",
      info: {
        title: "one",
        path: [],
      },
    });
    expect(d.size()).toBe(1);
    expect(d.get("0")).toEqual(None);
    expect(d.get("1")).toEqual(
      Ok({
        id: "1",
        info: {
          title: "one",
          path: [],
        },
      })
    );
    expect(Array.from(d.values(), (x) => x.id)).toEqual(["1"]);
    d.delete("1");
    expect(d.size()).toBe(0);
    expect(d.get("1")).toEqual(None);
  });

  it("yield folders", () => {
    const nodeList: Common.INodeList = [
      {
        id: "0", // root
        info: {
          title: "",
        },
      },
      {
        id: "1", // root/f1
        parentId: "0",
        info: {
          title: "f1",
        },
      },
      {
        id: "2", // root/e1
        parentId: "0",
        info: {
          title: "e1",
          url: "e1-url",
        },
      },
      {
        id: "3", // root/f1/e2
        parentId: "1",
        info: {
          title: "e2",
          url: "e2-url",
        },
      },
      {
        id: "4", // root/f1/f2
        parentId: "1",
        info: {
          title: "f2",
        },
      },
      {
        id: "5", // root/f1/f2/e3
        parentId: "4",
        info: {
          title: "e3",
          url: "e3-url",
        },
      },
    ];
    const want = [
      {
        id: "0",
        path: [],
      },
      {
        id: "1",
        path: ["f1"],
      },
      {
        id: "2",
        path: ["e1"],
      },
      {
        id: "3",
        path: ["f1", "e2"],
      },
      {
        id: "4",
        path: ["f1", "f2"],
      },
      {
        id: "5",
        path: ["f1", "f2", "e3"],
      },
    ];
    const d = Common.newINodeMap();
    for (const n of nodeList) {
      d.set(n);
    }
    const got = Array.from(d.values()).sort((a, b) => (a.id < b.id ? -1 : 1));
    expect(got.length).toBe(want.length);
    for (let i = 0; i < want.length; i++) {
      const g = got[i];
      const w = want[i];
      expect(g.id).toBe(w.id);
      expect(g.info.path).toBeTruthy();
      expect(g.info.path.join("/")).toBe(w.path.join("/"));
    }
  });
});

describe("isINodeInfo", () => {
  const tests = [
    {
      name: "minimal",
      value: {
        title: "t",
      },
      want: true,
    },
    {
      name: "full",
      value: {
        title: "t",
        url: "u",
        dateAdded: 10,
      },
      want: true,
    },
    {
      name: "undefined",
      value: undefined,
      want: false,
    },
    {
      name: "number title",
      value: {
        title: 10,
      },
      want: false,
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      const got = Common.isINodeInfo(value);
      if (want) {
        expect(got).toBeTruthy();
      } else {
        expect(got).toBeFalsy();
      }
    });
  }
});

describe("isINode", () => {
  const tests = [
    {
      name: "minimal",
      value: {
        id: "nid",
        info: {
          title: "t",
        },
      },
      want: true,
    },
    {
      name: "full",
      value: {
        id: "nid",
        parentId: "pid",
        info: {
          url: "u",
          title: "t",
          dateAdded: 10,
        },
      },
      want: true,
    },
    {
      name: "without id",
      value: {
        parentId: "pid",
        info: {
          url: "u",
          title: "t",
          dateAdded: 10,
        },
      },
      want: false,
    },
    {
      name: "number title",
      value: {
        id: "nid",
        parentId: "pid",
        info: {
          url: "u",
          title: 1000,
          dateAdded: 10,
        },
      },
      want: false,
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      const got = Common.isINode(value);
      if (want) {
        expect(got).toBeTruthy();
      } else {
        expect(got).toBeFalsy();
      }
    });
  }
});
