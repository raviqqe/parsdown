import { describe, expect, it } from "vitest";
import { iterableInput, stringInput } from "./input";

describe(stringInput.name, () => {
  it("iterates over a string", () => {
    const input = stringInput("abc");

    expect(input.next()).toBe("a");
    expect(input.next()).toBe("b");
    expect(input.next()).toBe("c");
  });

  it("handles save and restore", () => {
    const input = stringInput("abc");
    const state = input.save();

    expect(input.next()).toBe("a");

    input.restore(state);

    expect(input.next()).toBe("a");
    expect(input.next()).toBe("b");
    expect(input.next()).toBe("c");
  });
});

describe(iterableInput.name, () => {
  it("iterates over a string", () => {
    const input = iterableInput("abc");

    expect(input.next()).toBe("a");
    expect(input.next()).toBe("b");
    expect(input.next()).toBe("c");
  });

  it("handles save and restore", () => {
    const input = iterableInput("abc");
    const state = input.save();

    expect(input.next()).toBe("a");

    input.restore(state);

    expect(input.next()).toBe("a");
    expect(input.next()).toBe("b");
    expect(input.next()).toBe("c");
  });
});
