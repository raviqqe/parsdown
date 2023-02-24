import { Parser } from "./parser";
import { stringIterator } from "./input";

export const parseString = <V>(parser: Parser<string, V>, input: string): V =>
  parser(stringIterator(input));
