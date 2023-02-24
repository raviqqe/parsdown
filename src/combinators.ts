import { Parser } from "./parser";

export const any =
  <T>(): Parser<T, T> =>
  (input) => {
    const token = input.next();

    assertToken(token);

    return token;
  };

export const token =
  <T>(test: (token: T) => boolean): Parser<T, T> =>
  (input) => {
    const token = input.next();

    assertToken(token);

    if (!test(token)) {
      throw new Error("Unexpected token");
    }

    return token;
  };

export const sequence =
  <T, V extends [unknown, ...unknown[]]>(
    ...parsers: { [key in keyof V]: Parser<T, V[key]> }
  ): Parser<T, V> =>
  (input) =>
    parsers.map((parser) => parser(input)) as V;

export const many =
  <T, V>(parser: Parser<T, V>): Parser<T, V[]> =>
  (input) => {
    const values = [];

    for (;;) {
      const state = input.save();

      try {
        values.push(parser(input));
      } catch (_) {
        input.restore(state);
        break;
      }
    }

    return values;
  };

export const many1 = <T, V>(parser: Parser<T, V>): Parser<T, V[]> => {
  const parse = many(parser);

  return (input) => {
    const values = parse(input);

    if (values.length === 0) {
      throw new Error("Too few values");
    }

    return values;
  };
};

const assertToken: <T>(token: T | null) => asserts token is NonNullable<T> = <
  T
>(
  token: T | null
): asserts token is NonNullable<T> => {
  if (!token) {
    throw new Error("Unexpected end of tokens");
  }
};

export const surrounded =
  <T, V>(
    start: Parser<T, unknown>,
    content: Parser<T, V>,
    end: Parser<T, unknown>
  ): Parser<T, V> =>
  (input) => {
    start(input);
    const value = content(input);
    end(input);

    return value;
  };

export const map =
  <T, V, W>(parser: Parser<T, V>, callback: (value: V) => W): Parser<T, W> =>
  (input) =>
    callback(parser(input));

export const choice =
  <T, V extends [unknown, ...unknown[]]>(
    ...parsers: { [key in keyof V]: Parser<T, V[key]> }
  ): Parser<T, V[number]> =>
  (input) => {
    for (const parser of parsers) {
      const state = input.save();

      try {
        return parser(input);
      } catch (_) {
        input.restore(state);
      }
    }

    throw new Error("All parser failed");
  };

export const separatedBy =
  <T, V>(
    content: Parser<T, V>,
    separator: Parser<T, unknown>
  ): Parser<T, V[]> =>
  (input) => {
    const values = [];
    const state = input.save();

    try {
      values.push(content(input));
    } catch (_) {
      input.restore(state);
      return values;
    }

    for (;;) {
      const state = input.save();

      try {
        separator(input);
      } catch (_) {
        input.restore(state);
        return values;
      }

      values.push(content(input));
    }
  };

export const separatedOrEndedBy =
  <T, V>(
    content: Parser<T, V>,
    separator: Parser<T, unknown>
  ): Parser<T, V[]> =>
  (input) => {
    const values = [];
    const state = input.save();

    try {
      values.push(content(input));
    } catch (_) {
      input.restore(state);
      return values;
    }

    for (;;) {
      let state = input.save();

      try {
        separator(input);
        state = input.save();
        values.push(content(input));
      } catch (_) {
        input.restore(state);
        return values;
      }
    }
  };

export const lazy = <T, V>(createParser: () => Parser<T, V>): Parser<T, V> => {
  let parser: Parser<T, V> | undefined;

  return (input) => {
    if (!parser) {
      parser = createParser();
    }

    return parser(input);
  };
};

export const not = <T>(parser: Parser<T, unknown>): Parser<T, T> => {
  const parseAny = any<T>();

  return (input) => {
    const state = input.save();

    try {
      parser(input);
    } catch (_) {
      input.restore(state);
      return parseAny(input);
    }

    throw new Error("Parser succeeded");
  };
};

export const prefix = <T, V>(
  prefix: Parser<T, unknown>,
  parser: Parser<T, V>
): Parser<T, V> => map(sequence(prefix, parser), ([, value]) => value);

export const suffix = <T, V>(
  parser: Parser<T, V>,
  suffix: Parser<T, unknown>
): Parser<T, V> => map(sequence(parser, suffix), ([value]) => value);

// TODO
export const head = <T, V>(parser: Parser<T, V>): Parser<T, V> => parser;
