import { TokenIterator } from "./token-iterator";

export type Parser<T, S, V> = (iterator: TokenIterator<T, S>) => V;
