import { Parser } from "./parser";
import { TokenIterator } from "./token-iterator";

export const parse = <T, S, V>(
  iterator: TokenIterator<T, S>,
  parser: Parser<T, S, V>
): V => parser(iterator);
