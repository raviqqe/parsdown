import { describe, expect, it } from "vitest";
import {
  any,
  choice,
  lazy,
  many,
  many1,
  map,
  not,
  prefix,
  section,
  separatedBy,
  separatedOrEndedBy,
  sequence,
  suffix,
  surrounded,
  token,
} from "./combinators";
import { parseString } from "./parse";
import { Parser } from "./parser";

const a = token((character: string) => character === "a");
const b = token((character: string) => character === "b");
const c = token((character: string) => character === "c");

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
          token((character: string) => character === "1"),
          (x) => Number(x)
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
        map(a, (x) => x + "b"),
        "a"
      )
    ).toEqual("ab");
  });
});

describe(choice.name, () => {
  it("maps a value", () => {
    expect(
      parseString(
        choice(sequence<string, [string, string]>(a, b), sequence(a, a, b)),
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
    expect(() => parseString(separatedBy(a, b), "ab")).toThrowError(
      "Unexpected end of tokens"
    );
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

describe(lazy.name, () => {
  it("parses a recursive expression", () => {
    type Result = [string, Result | string];
    const parser: Parser<string, Result | string> = lazy(() =>
      choice(sequence(a, parser), b)
    );

    expect(parseString(parser, "aab")).toEqual(["a", ["a", "b"]]);
  });
});

describe(not.name, () => {
  it("parses a value", () => {
    expect(parseString(not(a), "b")).toBe("b");
  });

  it("fails to parse a value", () => {
    expect(() => parseString(not(a), "a")).toThrowError("Parser succeeded");
  });

  it("parses values", () => {
    expect(parseString(many(not(a)), "bb")).toEqual(["b", "b"]);
  });

  it("parses values with choice", () => {
    expect(parseString(many(not(choice(a, b))), "cc")).toEqual(["c", "c"]);
  });
});

describe(prefix.name, () => {
  it("parses a prefix", () => {
    expect(parseString(prefix(a, b), "ab")).toBe("b");
  });
});

describe(suffix.name, () => {
  it("parses a suffix", () => {
    expect(parseString(suffix(a, b), "ab")).toBe("a");
  });
});

describe(section.name, () => {
  it("parses a section", () => {
    expect(parseString(section(a, b), "ab")).toEqual(["a", "b"]);
  });

  it("parses a section terminated by another", () => {
    expect(parseString(section(a, many(any())), "abba")).toEqual([
      "a",
      ["b", "b"],
    ]);
  });
});
