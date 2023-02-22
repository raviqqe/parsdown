import { Parser } from "./parser";
import { TokenIterator } from "./token-iterator";

type Token<I extends TokenIterator<any, any>> = NonNullable<
  ReturnType<I["next"]>
>;

export const any =
  <I extends TokenIterator<any, any>>(): Parser<I, Token<I>> =>
  (iterator) => {
    const token = iterator.next();

    assertToken(token);

    return token;
  };

export const token =
  <I extends TokenIterator<any, any>>(
    test: (token: Token<I>) => boolean
  ): Parser<I, Token<I>> =>
  (iterator) => {
    const token = iterator.next();

    assertToken(token);

    if (!test(token)) {
      throw new Error("Unexpected token");
    }

    return token;
  };

type Sequence<T extends Parser<TokenIterator<any, any>, unknown>[]> = {
  [key in keyof T]: ReturnType<T[key]>;
};

export const sequence =
  <
    P extends [
      Parser<TokenIterator<any, any>, any>,
      ...Parser<TokenIterator<any, any>, any>[]
    ]
  >(
    ...parsers: P
  ): Parser<Parameters<P[number]>[0], Sequence<P>> =>
  (iterator) =>
    parsers.map((parser) => parser(iterator)) as Sequence<P>;

export const many =
  <P extends Parser<TokenIterator<any, any>, any>>(
    parser: P
  ): Parser<Parameters<P>[0], ReturnType<P>[]> =>
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

export const many1 = <P extends Parser<TokenIterator<any, any>, any>>(
  parser: P
): Parser<Parameters<P>[0], ReturnType<P>[]> => {
  const parse = many(parser);

  return (iterator) => {
    const values = parse(iterator);

    if (values.length === 0) {
      throw new Error("Too few values");
    }

    return values;
  };
};

export const surrounded =
  <
    P1 extends Parser<TokenIterator<any, any>, any>,
    P2 extends Parser<TokenIterator<any, any>, any>,
    P3 extends Parser<TokenIterator<any, any>, any>
  >(
    start: P1,
    content: P2,
    end: P3
  ): Parser<Parameters<P2>[0], ReturnType<P2>> =>
  (iterator) => {
    start(iterator);
    const value = content(iterator);
    end(iterator);

    return value;
  };

export const map =
  <P extends Parser<TokenIterator<any, any>, any>, Q>(
    callback: (value: ReturnType<P>) => Q,
    parser: P
  ): Parser<Parameters<P>[0], Q> =>
  (iterator) =>
    callback(parser(iterator));

export const choice =
  <
    P extends [
      Parser<TokenIterator<any, any>, any>,
      ...Parser<TokenIterator<any, any>, any>[]
    ]
  >(
    ...parsers: P
  ): Parser<Parameters<P[number]>[0], Sequence<P>[number]> =>
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

const assertToken: <T>(token: T | null) => asserts token is NonNullable<T> = <
  T
>(
  token: T | null
): asserts token is NonNullable<T> => {
  if (!token) {
    throw new Error("Unexpected end of tokens");
  }
};
