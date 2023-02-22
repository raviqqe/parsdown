import { Parser } from "./parser";
import { stringIterator, TokenIterator } from "./token-iterator";

export const parseString = <V>(
  parser: Parser<TokenIterator<string, number>, V>,
  input: string
): V => parser(stringIterator(input));
