import * as Func from "../Function";

describe("toNumber", () => {
  it("accept number", () => {
    expect(Func.toNumber(1)).toEqual({
      ok: true,
      value: 1,
    });
  });
  it("accept string", () => {
    expect(Func.toNumber("2")).toEqual({
      ok: true,
      value: 2,
    });
  });
  const failures = [
    {
      name: "reject string",
      value: "a",
    },
    {
      name: "reject boolean",
      value: true,
    },
  ];
  for (const { name, value } of failures) {
    it(name, () => {
      const got = Func.toNumber(value);
      expect(got.ok).toBeFalsy();
      expect(got.value.constructor.name).toEqual("InvalidNumberError");
    });
  }
});
