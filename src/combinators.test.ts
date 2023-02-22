import { describe, expect, it } from "vitest";
import { choice, many, many1, map, sequence, token } from "./combinators";
import { parseString } from "./parse";

const a = token((character) => character === "a");
const b = token((character) => character === "b");

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

describe(sequence.name, () => {
  it("parses a token", () => {
    expect(
      parseString(sequence(token((character) => character === "a")), "a")
    ).toEqual(["a"]);
  });

  it("parses tokens", () => {
    expect(
      parseString(
        sequence(
          token((character) => character === "a"),
          token((character) => character === "b")
        ),
        "ab"
      )
    ).toEqual(["a", "b"]);
  });

  it("parses tokens of different types", () => {
    const xs: [string, number] = parseString(
      sequence(
        token((character) => character === "a"),
        map(
          (x) => Number(x),
          token((character) => character === "1")
        )
      ),
      "a1"
    );

    expect(xs).toEqual(["a", 1]);
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

describe(map.name, () => {
  it("maps a value", () => {
    expect(
      parseString(
        map(
          (a) => a + "b",
          token((character) => character === "a")
        ),
        "a"
      )
    ).toEqual("ab");
  });
});

describe(choice.name, () => {
  it("maps a value", () => {
    expect(
      parseString(choice(sequence(a, b), sequence(a, a, b)), "aab")
    ).toEqual(["a", "a", "b"]);
  });
});
