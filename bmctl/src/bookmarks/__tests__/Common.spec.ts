import * as Common from "../Common";
import { None, Ok } from "../../common/Function";

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
