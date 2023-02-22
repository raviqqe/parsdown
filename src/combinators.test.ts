import { describe, expect, it } from "vitest";
import { many, many1, token } from "./combinators";
import { parseString } from "./parse";

describe(token.name, () => {
  it("parses a token", () => {
    expect(
      parseString(
        token((character) => character === "a"),
        "a"
      )
    ).toBe("a");
  });

  it("fails to parse a token", () => {
    expect(() =>
      parseString(
        token((character) => character === "a"),
        "b"
      )
    ).toThrowError("Unexpected token");
  });
});

describe(many.name, () => {
  it("parses many tokens", () => {
    expect(
      parseString(many(token((character) => character === "a")), "aa")
    ).toEqual(["a", "a"]);
  });

  it("fails to parse the last token", () => {
    expect(
      parseString(many(token((character) => character === "a")), "ab")
    ).toEqual(["a"]);
  });
});

describe(many1.name, () => {
  it("parses many tokens", () => {
    expect(
      parseString(many1(token((character) => character === "a")), "aa")
    ).toEqual(["a", "a"]);
  });

  it("fails to parse 0 token", () => {
    expect(() =>
      parseString(many1(token((character) => character === "a")), "")
    ).toThrowError("Too few values");
  });
});
