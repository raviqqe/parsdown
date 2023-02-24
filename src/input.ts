export interface Input<T> {
  next: () => T | null;
  save: () => number;
  restore: (state: number) => void;
}

export const stringInput = (string: string): Input<string> => {
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

export const iterableInput = <T>(iterable: Iterable<T>): Input<T> => {
  let index = 0;
  const tokens: T[] = [];
  const input = iterable[Symbol.iterator]();

  return {
    next: () => {
      if (index < tokens.length) {
        return tokens[index++] ?? null;
      }

      const result = input.next();

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
