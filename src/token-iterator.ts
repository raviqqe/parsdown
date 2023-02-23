export interface TokenIterator<T, S> {
  next: () => T | null;
  save: () => S;
  restore: (state: S) => void;
}

export const stringIterator = (
  string: string
): TokenIterator<string, number> => {
  let index = 0;

  return {
    next: () => {
      const character = string[index];
      index++;
      return character ?? null;
    },
    restore: (oldIndex: number) => (index = oldIndex),
    save: () => index,
  };
};

export const iterableIterator = <T>(
  iterable: Iterable<T>
): TokenIterator<string, number> => {
  let index = 0;
  let tokens = [];
  let iterator = iterable[Symbol.iterator]();

  return {
    next: () => {
      const result = iterator.next();

      if (result.done) {
        tokens.push(result);
      }

      index++;

      return result.value;
    },
    restore: (oldIndex: number) => (index = oldIndex),
    save: () => index,
  };
};
