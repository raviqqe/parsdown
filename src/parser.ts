import type { Input } from "./input.js";

export type Parser<T, V> = (input: Input<T>) => V;
