import { TokenIterator } from "./token-iterator";

export type Parser<I extends TokenIterator<any, any>, O> = (iterable: I) => O;
