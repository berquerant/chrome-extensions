import * as Common from "../Common";

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
    expect(d.get("0").ok).toBeFalsy();
    expect(d.get("1").ok).toBeTruthy();
    expect(d.get("1").node.id).toBe("1");
    expect(Array.from(d.values(), (x) => x.id)).toEqual(["1"]);
    d.delete("1");
    expect(d.size()).toBe(0);
    expect(d.get("1").ok).toBeFalsy();
  });
});
