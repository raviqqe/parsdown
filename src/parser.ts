import { TokenIterator } from "./token-iterator";

export type Parser<T, S, V> = (iterable: TokenIterator<T, S>) => V;
