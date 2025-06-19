import { describe, expect, it } from "bun:test";
import { JsonStringify } from "./JsonStringify";

describe("JsonStringify", () => {
  it("sorts keys in provided order by default", () => {
    const obj = { b: 1, a: 2, c: 3 };
    // Default sorting to provided order
    expect(JsonStringify(obj)).toBe('{"b":1,"a":2,"c":3}');
  });

  it("sorts keys using cmp by key", () => {
    const obj = { b: 1, a: 2, c: 3 };
    // Reverse alphabetical order
    expect(JsonStringify(obj, { cmp: (a, b) => b.key.localeCompare(a.key) })).toBe(
      '{"c":3,"b":1,"a":2}'
    );
  });

  it("sorts keys using cmp by value", () => {
    const obj = { b: 1, a: 3, c: 2 };
    // Sort by value
    expect(JsonStringify(obj, { cmp: (a, b) => Number(a.value) - Number(b.value) })).toBe(
      '{"b":1,"c":2,"a":3}'
    );
  });

  it("sorts keys by path", () => {
    const obj = {
      c: {
        y: { a: 1, b: 2 },
        x: { d: 3, c: 4 },
      },
      a: {
        z: { b: 5, a: 6 },
        w: { e: 7, f: 8 },
      },
      b: {
        v: { h: 9, g: 10 },
      },
    };

    expect(
      JsonStringify(obj, {
        // Custom CMP: Sort by path (even depth alpahabetical, odd depth reverse alphabetical)
        cmp: (a, b) => {
          const depth = a.path.split(".").length - 1; // Calculate depth based on path
          const isEvenDepth = depth % 2 === 0; // Is even depth?
          if (isEvenDepth) return a.key.localeCompare(b.key); // Even depth: alphabetical
          else return b.key.localeCompare(a.key); // Odd depth: reverse alphabetical
        },
      })
    ).toBe(
      '{"a":{"z":{"a":6,"b":5},"w":{"e":7,"f":8}},"b":{"v":{"g":10,"h":9}},"c":{"y":{"a":1,"b":2},"x":{"c":4,"d":3}}}'
    );
  });

  it("supports space option for pretty printing", () => {
    const obj = { a: 1, b: 2 };
    expect(JsonStringify(obj, { space: 2 })).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("supports cycles option to handle circular references", () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    expect(JsonStringify(obj, { cycles: true })).toBe('{"a":1,"self":"__cycle__"}');
  });

  it("throws error on circular reference if cycles is false", () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    expect(() => JsonStringify(obj)).toThrow("Converting circular structure to JSON");
  });

  it("collapses empty objects and arrays when collapseEmpty is true", () => {
    expect(JsonStringify({}, { collapseEmpty: true })).toBe("{}");
    expect(JsonStringify([], { collapseEmpty: true })).toBe("[]");
    expect(JsonStringify({ a: [] }, { collapseEmpty: true })).toBe('{"a":[]}');
    expect(JsonStringify({ a: {} }, { collapseEmpty: true })).toBe('{"a":{}}');
  });
});
