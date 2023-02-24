import { stringInput } from "./input";
import { Parser } from "./parser";

export const parseString = <V>(parser: Parser<string, V>, input: string): V =>
  parser(stringInput(input));
