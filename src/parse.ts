import { stringInput } from "./input.js";
import type { Parser } from "./parser.js";

export const parseString = <V>(parser: Parser<string, V>, input: string): V =>
  parser(stringInput(input));
