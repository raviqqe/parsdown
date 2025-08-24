import type { Parser } from "./parser.js";

export const token =
  <T>(test: (token: T) => boolean): Parser<T, T> =>
  (input) => {
    const token = input.next();

    if (!token) {
      throw new Error("Unexpected end of tokens");
    } else if (!test(token)) {
      throw new Error("Unexpected token");
    }

    return token;
  };

export const any = <T>(): Parser<T, T> => {
  const parseAny = token((_: T) => true);

  return (input) => {
    for (const head of input.getHeads()) {
      const state = input.save();

      try {
        head(input);
      } catch (_) {
        input.restore(state);
        continue;
      }

      throw new Error("Unexpected head");
    }

    return parseAny(input);
  };
};

export const sequence =
  <T, V extends [unknown, ...unknown[]]>(
    ...parsers: { [K in keyof V]: Parser<T, V[K]> }
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

export const surrounded =
  <T, V>(
    start: Parser<T, unknown>,
    content: Parser<T, V>,
    end: Parser<T, unknown>,
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
    ...parsers: { [K in keyof V]: Parser<T, V[K]> }
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
    separator: Parser<T, unknown>,
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
    separator: Parser<T, unknown>,
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
    parser ??= createParser();

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
  parser: Parser<T, V>,
): Parser<T, V> => map(sequence(prefix, parser), ([, value]) => value);

export const suffix = <T, V>(
  parser: Parser<T, V>,
  suffix: Parser<T, unknown>,
): Parser<T, V> => map(sequence(parser, suffix), ([value]) => value);

export const section =
  <T, V1, V2>(
    head: Parser<T, V1>,
    content: Parser<T, V2>,
  ): Parser<T, [V1, V2]> =>
  (input) => {
    const headValue = head(input);
    input.pushHead(head);

    try {
      const contentValue = content(input);
      return [headValue, contentValue];
    } finally {
      input.popHead();
    }
  };

export const parallel =
  <T, V extends [unknown, ...unknown[]]>(
    ...parsers: { [K in keyof V]: Parser<T, V[K]> }
  ): Parser<T, V> =>
  (input) => {
    const values = [];

    for (const parser of parsers) {
      const state = input.save();
      values.push(parser(input));
      input.restore(state);
    }

    return values as V;
  };

export const option = <T, V>(parser: Parser<T, V>): Parser<T, V | null> =>
  choice(parser, none());

export const none =
  <T>(): Parser<T, null> =>
  () =>
    null;
