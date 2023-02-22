type Parser<T, S, V> = (iterable: IIterator<T, S>) => V;

interface IIterator<T, S> {
  next: () => T;
  save: () => S;
  restore: (state: S) => void;
}

export const parse = <T, S, V>(
  iterator: IIterator<T, S>,
  parser: Parser<T, S, V>
): V => parser(iterator);

export const token =
  <T, S>(test: (token: T) => boolean) =>
  (iterator: IIterator<T, S>): T => {
    const token = iterator.next();

    if (!test(token)) {
      throw new Error(`Unexpected token: ${token}`);
    }

    return token;
  };

export const many =
  <T, S, V>(parser: Parser<T, S, V>) =>
  (iterator: IIterator<T, S>): V[] => {
    const values = [];

    while (true) {
      const state = iterator.save();

      try {
        values.push(parser(iterator));
      } catch (_) {
        iterator.restore(state);
        break;
      }
    }

    return values;
  };
