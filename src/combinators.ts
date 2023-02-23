import { Parser } from "./parser";

export const any =
  <T>(): Parser<T, T> =>
  (iterator) => {
    const token = iterator.next();

    assertToken(token);

    return token;
  };

export const token =
  <T>(test: (token: T) => boolean): Parser<T, T> =>
  (iterator) => {
    const token = iterator.next();

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
  (iterator) =>
    parsers.map((parser) => parser(iterator)) as V;

export const many =
  <T, V>(parser: Parser<T, V>): Parser<T, V[]> =>
  (iterator) => {
    const values = [];

    for (;;) {
      const state = iterator.save();

      try {
        values.push(parser(iterator));
      } catch (_) {
        iterator.restore(state);
        break;
      }
    }

    return values;
  };

export const many1 = <T, V>(parser: Parser<T, V>): Parser<T, V[]> => {
  const parse = many(parser);

  return (iterator) => {
    const values = parse(iterator);

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
  (iterator) => {
    start(iterator);
    const value = content(iterator);
    end(iterator);

    return value;
  };

export const map =
  <T, V, W>(callback: (value: V) => W, parser: Parser<T, V>): Parser<T, W> =>
  (iterator) =>
    callback(parser(iterator));

export const choice =
  <T, V extends [unknown, ...unknown[]]>(
    ...parsers: { [key in keyof V]: Parser<T, V[key]> }
  ): Parser<T, V[number]> =>
  (iterator) => {
    for (const parser of parsers) {
      const state = iterator.save();

      try {
        return parser(iterator);
      } catch (_) {
        iterator.restore(state);
      }
    }

    throw new Error("All parser failed");
  };

export const separatedBy =
  <T, V>(
    content: Parser<T, V>,
    separator: Parser<T, unknown>
  ): Parser<T, V[]> =>
  (iterator) => {
    const values = [];
    const state = iterator.save();

    try {
      values.push(content(iterator));
    } catch (_) {
      iterator.restore(state);
      return values;
    }

    for (;;) {
      const state = iterator.save();

      try {
        separator(iterator);
      } catch (_) {
        iterator.restore(state);
        return values;
      }

      values.push(content(iterator));
    }
  };

export const separatedOrEndedBy =
  <T, V>(
    content: Parser<T, V>,
    separator: Parser<T, unknown>
  ): Parser<T, V[]> =>
  (iterator) => {
    const values = [];
    const state = iterator.save();

    try {
      values.push(content(iterator));
    } catch (_) {
      iterator.restore(state);
      return values;
    }

    for (;;) {
      let state = iterator.save();

      try {
        separator(iterator);
        state = iterator.save();
        values.push(content(iterator));
      } catch (_) {
        iterator.restore(state);
        return values;
      }
    }
  };

export const lazy = <T, V>(createParser: () => Parser<T, V>): Parser<T, V> => {
  let parser: Parser<T, V> | undefined;

  return (iterator) => {
    if (!parser) {
      parser = createParser();
    }

    return parser(iterator);
  };
};
