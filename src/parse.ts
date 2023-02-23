import { Parser } from "./parser";
import { stringIterator } from "./token-iterator";

export const parseString = <V>(parser: Parser<string, V>, input: string): V =>
  parser(stringIterator(input));
