export interface Input<T> extends BaseInput<T> {
  pushHead: (parser: Parser<T>) => void;
  popHead: () => void;
  heads: Parser<T>[];
}

export interface BaseInput<T> {
  next: () => T | null;
  save: () => number;
  restore: (state: number) => void;
}

type Parser<T> = (input: Input<T>) => unknown;

export const stringInput = (string: string): Input<string> => {
  let index = 0;

  return wrapBaseInput({
    next: () => {
      const character = string[index];
      index++;
      return character ?? null;
    },
    restore: (oldIndex: number) => (index = oldIndex),
    save: () => index,
  });
};

export const iterableInput = <T>(iterable: Iterable<T>): Input<T> => {
  let index = 0;
  const tokens: T[] = [];
  const input = iterable[Symbol.iterator]();

  return wrapBaseInput({
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
  });
};

const wrapBaseInput = <T>(input: BaseInput<T>): Input<T> => {
  const heads: Parser<T>[] = [];

  return {
    ...input,
    pushHead: (head) => heads.push(head),
    popHead: () => heads.pop(),
    heads,
  };
};
