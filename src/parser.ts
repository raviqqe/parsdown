import { Input } from "./input";

export type Parser<T, V> = (iterator: Input<T>) => V;
