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
      },
    });
    expect(d.size()).toBe(1);
    expect(d.get("0")).toEqual(None);
    expect(d.get("1")).toEqual(
      Ok({
        id: "1",
        info: {
          title: "one",
        },
      })
    );
    expect(Array.from(d.values(), (x) => x.id)).toEqual(["1"]);
    d.delete("1");
    expect(d.size()).toBe(0);
    expect(d.get("1")).toEqual(None);
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
