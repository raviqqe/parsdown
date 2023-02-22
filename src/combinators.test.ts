import { describe, expect, it } from "vitest";
import { many, token } from "./combinators";
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
