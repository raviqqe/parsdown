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
