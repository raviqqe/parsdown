import { Parser } from "./parser";
import { stringInput } from "./input";

export const parseString = <V>(parser: Parser<string, V>, input: string): V =>
  parser(stringInput(input));
