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
): TokenIterator<T, number> => {
  let index = 0;
  let tokens: T[] = [];
  let iterator = iterable[Symbol.iterator]();

  return {
    next: () => {
      if (index < tokens.length) {
        return tokens[index] ?? null;
      }

      const result = iterator.next();

      if (result.done) {
        return null;
      }

      tokens.push(result.value);
      index++;

      return result.value;
    },
    restore: (oldIndex: number) => (index = oldIndex),
    save: () => index,
  };
};
