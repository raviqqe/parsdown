import { Parser } from "./parser";

export const any =
  <T, S>(): Parser<T, S, T> =>
  (iterator) => {
    const token = iterator.next();

    assertToken(token);

    return token;
  };

export const token =
  <T, S>(test: (token: T) => boolean): Parser<T, S, T> =>
  (iterator) => {
    const token = iterator.next();

    assertToken(token);

    if (!test(token)) {
      throw new Error("Unexpected token");
    }

    return token;
  };

export const sequence =
  <T, S, V extends [unknown, ...unknown[]]>(
    ...parsers: { [key in keyof V]: Parser<T, S, V[key]> }
  ): Parser<T, S, V> =>
  (iterator) =>
    parsers.map((parser) => parser(iterator)) as V;

export const many =
  <T, S, V>(parser: Parser<T, S, V>): Parser<T, S, V[]> =>
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

export const many1 = <T, S, V>(parser: Parser<T, S, V>): Parser<T, S, V[]> => {
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
  <T, S, V>(
    start: Parser<T, S, unknown>,
    content: Parser<T, S, V>,
    end: Parser<T, S, unknown>
  ): Parser<T, S, V> =>
  (iterator) => {
    start(iterator);
    const value = content(iterator);
    end(iterator);

    return value;
  };

export const map =
  <T, S, V, W>(
    callback: (value: V) => W,
    parser: Parser<T, S, V>
  ): Parser<T, S, W> =>
  (iterator) =>
    callback(parser(iterator));

export const choice =
  <T, S, V extends [unknown, ...unknown[]]>(
    ...parsers: { [key in keyof V]: Parser<T, S, V[key]> }
  ): Parser<T, S, V[number]> =>
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
  <T, S, V>(
    content: Parser<T, S, V>,
    separator: Parser<T, S, unknown>
  ): Parser<T, S, V[]> =>
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
  <T, S, V>(
    content: Parser<T, S, V>,
    separator: Parser<T, S, unknown>
  ): Parser<T, S, V[]> =>
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
