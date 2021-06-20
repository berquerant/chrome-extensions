import * as Time from "../Time";

describe("timestringToDate", () => {
  const tests = [
    {
      name: "empty",
      value: "",
      want: {
        ok: false,
      },
    },
    {
      name: "valid date",
      value: "2021-06-01",
      want: {
        ok: true,
        value: new Date(2021, 5, 1),
      },
    },
  ];
  for (const { name, value, want } of tests) {
    it(name, () => {
      const got = Time.timestringToDate(value);
      if (got.ok) {
        expect(got.value.getTime()).toEqual(want.value.getTime());
      } else {
        expect(got.value.constructor.name).toEqual("InvalidTimestringError");
      }
    });
  }
});

describe("dateToTimestring", () => {
  it("success", () => {
    expect(Time.dateToTimestring(new Date(2021, 5, 1))).toEqual("2021-06-01");
  });
});
