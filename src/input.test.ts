import { describe, expect, it } from "vitest";
import { iterableIterator, stringIterator } from "./input";

describe(stringIterator.name, () => {
  it("iterates over a string", () => {
    const iterator = stringIterator("abc");

    expect(iterator.next()).toBe("a");
    expect(iterator.next()).toBe("b");
    expect(iterator.next()).toBe("c");
  });

  it("handles save and restore", () => {
    const iterator = stringIterator("abc");
    const state = iterator.save();

    expect(iterator.next()).toBe("a");

    iterator.restore(state);

    expect(iterator.next()).toBe("a");
    expect(iterator.next()).toBe("b");
    expect(iterator.next()).toBe("c");
  });
});

describe(iterableIterator.name, () => {
  it("iterates over a string", () => {
    const iterator = iterableIterator("abc");

    expect(iterator.next()).toBe("a");
    expect(iterator.next()).toBe("b");
    expect(iterator.next()).toBe("c");
  });

  it("handles save and restore", () => {
    const iterator = iterableIterator("abc");
    const state = iterator.save();

    expect(iterator.next()).toBe("a");

    iterator.restore(state);

    expect(iterator.next()).toBe("a");
    expect(iterator.next()).toBe("b");
    expect(iterator.next()).toBe("c");
  });
});
