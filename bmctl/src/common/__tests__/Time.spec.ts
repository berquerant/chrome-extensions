import * as Time from "../Time";
import { Ok, Err } from "../Function";

describe("timestringToDate", () => {
  const tests = [
    {
      name: "empty",
      value: "",
      want: Err(new Time.InvalidTimestringError()),
    },
    {
      name: "valid date",
      value: "2021-06-01",
      want: Ok(new Date(2021, 5, 1)),
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      const got = Time.timestringToDate(value);
      if (got.ok) {
        const w = want as Ok<Date>;
        expect(got.value.getTime()).toEqual(w.value.getTime());
      } else {
        expect(got.value.constructor.name).toEqual(want.value.constructor.name);
      }
    });
  }
});

describe("dateToTimestring", () => {
  it("success", () => {
    expect(Time.dateToTimestring(new Date(2021, 5, 1))).toEqual("2021-06-01");
  });
});
