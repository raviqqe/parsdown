import { describe, expect, it } from "vitest";
import {
  choice,
  many,
  many1,
  map,
  separatedBy,
  separatedOrEndedBy,
  sequence,
  surrounded,
  token,
} from "./combinators";
import { parseString } from "./parse";

const a = token<string, number>((character) => character === "a");
const b = token<string, number>((character) => character === "b");
const c = token<string, number>((character) => character === "c");

describe(token.name, () => {
  it("parses a token", () => {
    expect(parseString(a, "a")).toBe("a");
  });

  it("fails to parse a token", () => {
    expect(() => parseString(a, "b")).toThrowError("Unexpected token");
  });
});

describe(sequence.name, () => {
  it("parses a token", () => {
    expect(parseString(sequence(a), "a")).toEqual(["a"]);
  });

  it("parses tokens", () => {
    expect(parseString(sequence(a, b), "ab")).toEqual(["a", "b"]);
  });

  it("parses tokens of different types", () => {
    const xs: [string, number] = parseString(
      sequence(
        a,
        map(
          (x) => Number(x),
          token<string, number>((character) => character === "1")
        )
      ),
      "a1"
    );

    expect(xs).toEqual(["a", 1]);
  });
});

describe(many.name, () => {
  it("parses many tokens", () => {
    expect(parseString(many(a), "aa")).toEqual(["a", "a"]);
  });

  it("fails to parse the last token", () => {
    expect(parseString(many(a), "ab")).toEqual(["a"]);
  });
});

describe(many1.name, () => {
  it("parses many tokens", () => {
    expect(parseString(many1(a), "aa")).toEqual(["a", "a"]);
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
        map((x) => x + "b", a),
        "a"
      )
    ).toEqual("ab");
  });
});

describe(choice.name, () => {
  it("maps a value", () => {
    expect(
      parseString(
        choice<string, number, [[string, string], [string, string, string]]>(
          sequence(a, b),
          sequence(a, a, b)
        ),
        "aab"
      )
    ).toEqual(["a", "a", "b"]);
  });
});

describe(surrounded.name, () => {
  it("parses a surrounded content", () => {
    expect(parseString(surrounded(a, b, c), "abc")).toEqual("b");
  });
});

describe(separatedBy.name, () => {
  it("parses nothing", () => {
    expect(parseString(separatedBy(a, b), "")).toEqual([]);
  });

  it("parses a value", () => {
    expect(parseString(separatedBy(a, b), "a")).toEqual(["a"]);
  });

  it("parses two values", () => {
    expect(parseString(separatedBy(a, b), "aba")).toEqual(["a", "a"]);
  });

  it("parses three values", () => {
    expect(parseString(separatedBy(a, b), "ababa")).toEqual(["a", "a", "a"]);
  });

  it("fails to parse values", () => {
    expect(() => parseString(separatedBy(a, b), "ab")).toThrowError();
  });

  it("does not parse a separator", () => {
    expect(parseString(separatedOrEndedBy(a, b), "b")).toEqual([]);
  });

  it("parses a value after separated values", () => {
    expect(parseString(sequence(separatedBy(a, b), c), "abac")).toEqual([
      ["a", "a"],
      "c",
    ]);
  });
});

describe(separatedOrEndedBy.name, () => {
  it("parses nothing", () => {
    expect(parseString(separatedOrEndedBy(a, b), "")).toEqual([]);
  });

  it("parses a value", () => {
    expect(parseString(separatedOrEndedBy(a, b), "a")).toEqual(["a"]);
  });

  it("parses two values", () => {
    expect(parseString(separatedOrEndedBy(a, b), "aba")).toEqual(["a", "a"]);
  });

  it("parses two values with the last separator", () => {
    expect(parseString(separatedOrEndedBy(a, b), "abab")).toEqual(["a", "a"]);
  });

  it("parses three values", () => {
    expect(parseString(separatedOrEndedBy(a, b), "ababa")).toEqual([
      "a",
      "a",
      "a",
    ]);
  });

  it("parses three values with the last separator", () => {
    expect(parseString(separatedOrEndedBy(a, b), "ababab")).toEqual([
      "a",
      "a",
      "a",
    ]);
  });

  it("does not parse a separator", () => {
    expect(parseString(separatedOrEndedBy(a, b), "b")).toEqual([]);
  });

  it("parses a value after separated values", () => {
    expect(parseString(sequence(separatedOrEndedBy(a, b), c), "ababc")).toEqual(
      [["a", "a"], "c"]
    );
  });
});
