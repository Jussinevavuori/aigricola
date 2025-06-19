import { describe, expect, it } from "bun:test";
import { findAndReplaceText } from "./findAndReplace";

describe("findAndReplaceText", () => {
  const sample = "Hello world!\nThis is a test file.\nReplace me.\nAnother line with test.\n";

  it("F+R with no matches", () => {
    const result = findAndReplaceText({
      content: sample,
      find: "notfound",
      replaceWith: "SHOULDNOTAPPEAR",
    });
    expect(result).toBe(sample);
  });

  it("F+R string literal with string literal", () => {
    const result = findAndReplaceText({
      content: sample,
      find: "Replace me.",
      replaceWith: "Replaced!",
    });
    expect(result).toContain("Replaced!");
    expect(result).not.toContain("Replace me.");
  });

  it("F+R regex with string literal", () => {
    const result = findAndReplaceText({
      content: sample,
      find: /test/g,
      replaceWith: "exam",
    });
    expect(result).toContain("exam file.");
    expect(result).toContain("line with exam.");
  });

  it("F+R regex with replacing contents of capture group", () => {
    // Use named capture groups for clarity
    const result = findAndReplaceText({
      content: sample,
      find: /(?<first>Hello) (?<second>world)/,
      replaceWith: { first: "HI", second: "EARTH" },
    });
    expect(result).toContain("HI EARTH!");
  });

  it("replaces ALL occurrences of a string", () => {
    const content = "foo bar foo baz foo";
    const result = findAndReplaceText({
      content,
      find: "foo",
      replaceWith: "qux",
    });
    expect(result).toBe("qux bar qux baz qux");
  });

  it("replaces ALL occurrences of a regex", () => {
    const content = "one two one two one";
    const result = findAndReplaceText({
      content,
      find: /one/g,
      replaceWith: "1",
    });
    expect(result).toBe("1 two 1 two 1");
  });
});

describe("findAndReplaceText for translations", () => {
  const cases: [string, string][] = [
    // Simple calls
    [`t("keys.example")`, `t("new-key")`],
    [`t('keys.example')`, `t('new-key')`],
    [`t(` + "`keys.example`" + `)`, `t(` + "`new-key`" + `)`],
    [`t.rich("keys.example")`, `t.rich("new-key")`],
    [`t.rich('keys.example')`, `t.rich('new-key')`],
    [`t.rich(` + "`keys.example`" + `)`, `t.rich(` + "`new-key`" + `)`],
    // With options
    [`t("keys.example", { name: "Alice" })`, `t("new-key", { name: "Alice" })`],
    [`t('keys.example', { name: 'Alice' })`, `t('new-key', { name: 'Alice' })`],
    [
      `t(` + "`keys.example`" + `, { name: ` + "`Alice`" + ` })`,
      `t(` + "`new-key`" + `, { name: ` + "`Alice`" + ` })`,
    ],
    [`t.rich("keys.example", { name: "Alice" })`, `t.rich("new-key", { name: "Alice" })`],
    [`t.rich('keys.example', { name: 'Alice' })`, `t.rich('new-key', { name: 'Alice' })`],
    [
      `t.rich(` + "`keys.example`" + `, { name: ` + "`Alice`" + ` })`,
      `t.rich(` + "`new-key`" + `, { name: ` + "`Alice`" + ` })`,
    ],
    // Formatted (multiline)
    [
      `
t.rich(
  "keys.example",
  {
    name: "Alice"
  }
)`,
      `
t.rich(
  "new-key",
  {
    name: "Alice"
  }
)`,
    ],
  ];

  // Regex to match t/t.rich with any string type for the key, using a named group for the key
  const keyRegexStr = `(t(?:\\.rich)?\\s*\\(\\s*["'\`])(?<key>__TRANSLATION_KEY__)(["'\`])`;
  const keyToFind = "keys\\.example";
  const keyRegex = new RegExp(keyRegexStr.replace("__TRANSLATION_KEY__", keyToFind), "gm");

  it("updates translation keys in all scenarios", () => {
    for (const [input, expected] of cases) {
      const replaced = findAndReplaceText({
        content: input,
        find: keyRegex,
        replaceWith: { key: "new-key" },
      });
      expect(replaced).toBe(expected);
    }
  });
});
