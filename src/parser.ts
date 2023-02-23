import { TokenIterator } from "./token-iterator";

export type Parser<T, V> = (iterator: TokenIterator<T>) => V;
