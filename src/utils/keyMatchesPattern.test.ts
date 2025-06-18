import { describe, expect, it } from "bun:test";
import { keyMatchesPattern } from "./keyMatchesPattern";

describe("keyMatchesPattern", () => {
  it("matches exact key", () => {
    expect(keyMatchesPattern("actions.move", "actions.move")).toBe(true);
  });

  it("matches when pattern is a prefix of key", () => {
    expect(keyMatchesPattern("actions.move.left", "actions.move")).toBe(true);
    expect(keyMatchesPattern("a.b.c.d", "a.b")).toBe(true);
  });

  it("does not match when pattern is longer than key", () => {
    expect(keyMatchesPattern("actions.move", "actions.move.left")).toBe(false);
    expect(keyMatchesPattern("a.b", "a.b.c")).toBe(false);
  });

  it("does not match partial namespace", () => {
    expect(keyMatchesPattern("attachments.uploading", "attachments.upload")).toBe(false);
    expect(keyMatchesPattern("foo.bar", "foo.ba")).toBe(false);
  });

  it("matches empty pattern (should always be true)", () => {
    expect(keyMatchesPattern("anything", "")).toBe(true);
    expect(keyMatchesPattern("", "")).toBe(true);
  });

  it("does not match empty key if pattern is not empty", () => {
    expect(keyMatchesPattern("", "something")).toBe(false);
  });

  it("matches single-segment keys and patterns", () => {
    expect(keyMatchesPattern("foo", "foo")).toBe(true);
    expect(keyMatchesPattern("foo.bar", "foo")).toBe(true);
    expect(keyMatchesPattern("foo", "bar")).toBe(false);
  });

  it("handles extra dots gracefully", () => {
    expect(keyMatchesPattern(".foo.bar.", ".foo.bar.")).toBe(true);
    expect(keyMatchesPattern("foo.bar", ".foo.bar.")).toBe(true);
    expect(keyMatchesPattern(".foo.bar.", "foo.bar")).toBe(true);
  });
});
