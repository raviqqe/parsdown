import { Parser } from "./parser";
import { TokenIterator } from "./token-iterator";

export const any =
  <T, S>() =>
  (iterator: TokenIterator<T, S>): T => {
    const token = iterator.next();

    assertToken(token);

    return token;
  };

export const token =
  <T, S>(test: (token: T) => boolean) =>
  (iterator: TokenIterator<T, S>): T => {
    const token = iterator.next();

    assertToken(token);

    if (!test(token)) {
      throw new Error("Unexpected token");
    }

    return token;
  };

export const many =
  <T, S, V>(parser: Parser<T, S, V>) =>
  (iterator: TokenIterator<T, S>): V[] => {
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

const assertToken: <T>(token: T | null) => asserts token is NonNullable<T> = <
  T
>(
  token: T | null
): asserts token is NonNullable<T> => {
  if (!token) {
    throw new Error("Unexpected end of tokens");
  }
};
