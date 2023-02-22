export interface TokenIterator<T, S> {
  next: () => T;
  save: () => S;
  restore: (state: S) => void;
}
