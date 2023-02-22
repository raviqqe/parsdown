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
