import { Input } from "./input";

export type Parser<T, V> = (input: Input<T>) => V;
