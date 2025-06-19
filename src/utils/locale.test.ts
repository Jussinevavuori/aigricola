import { describe, expect, it, jest } from "bun:test";
import { Locale, MessagesObject } from "./locale";

function createLocale(messages: MessagesObject) {
  // Provide dummy Bun.BunFile and required fields for testing
  return new Locale({
    file: { write: async () => {} } as any,
    messages,
    name: "en-US",
    index: 0,
    filePath: "en-US.json",
    format: { sort: "alphabetically", indent: "2" },
  });
}

describe("getMessage", () => {
  const messages = {
    greeting: "Hello",
    user: {
      name: "Alice",
      details: {
        age: "30",
        hobbies: ["reading", "coding"],
      },
    },
    items: [
      { id: "1", value: "Item 1" },
      { id: "2", value: "Item 2" },
    ],
  };
  const locale = createLocale(messages);

  it("returns a simple string value", () => {
    expect(locale.getMessage("greeting")).toBe("Hello");
  });

  it("returns a deeply nested value", () => {
    expect(locale.getMessage("user.details.age")).toBe("30");
  });

  it("returns a value from an array", () => {
    expect(locale.getMessage("user.details.hobbies.1")).toBe("coding");
  });

  it("returns a value from an array of objects", () => {
    expect(locale.getMessage("items.0.value")).toBe("Item 1");
  });

  it("returns undefined for non-existent key", () => {
    expect(locale.getMessage("user.details.height")).toBeUndefined();
  });

  it("returns undefined for invalid array index", () => {
    expect(locale.getMessage("user.details.hobbies.x")).toBeUndefined();
  });
});

describe("setMessage", () => {
  it("sets a simple string value", () => {
    const locale = createLocale({});
    locale.setMessage("greeting", "Hi");
    expect(locale.getMessage("greeting")).toBe("Hi");
  });

  it("sets a deeply nested value, creating objects as needed", () => {
    const locale = createLocale({});
    locale.setMessage("user.details.name", "Bob");
    expect(locale.getMessage("user.details.name")).toBe("Bob");
  });

  it("sets a value in an array, creating arrays as needed", () => {
    const locale = createLocale({});
    locale.setMessage("items.0.value", "Item 1");
    expect(locale.getMessage("items.0.value")).toBe("Item 1");
  });
});

describe("removeMessage", () => {
  it("removes a nested key", () => {
    const locale = createLocale({ user: { details: { name: "Alice" } }, keep: "yes" });
    locale.removeMessage("user.details.name");
    expect(locale.getMessage("user.details.name")).toBeUndefined();
    expect(locale.getMessage("keep")).toBe("yes");
  });

  it("removes an array element", () => {
    const locale = createLocale({ items: ["a"] });
    locale.removeMessage("items.0");
    expect(locale.getMessage("items.0")).toBeUndefined();
  });

  it("does nothing if key does not exist", () => {
    const locale = createLocale({ a: { b: "c" } });
    locale.removeMessage("a.x");
    expect(locale.getMessage("a.b")).toBe("c");
  });
});

describe("getMessages and getFlatMessages", () => {
  it("returns inflated and deflated messages", () => {
    const messages = { greeting: "Hello", user: { name: "Alice" } };
    const locale = createLocale(messages);
    expect(locale.getMessages()).toEqual(messages);
    expect(locale.getFlatMessages()["greeting"]).toBe("Hello");
    expect(locale.getFlatMessages()["user.name"]).toBe("Alice");
  });

  it("resolves overlaps correctly for empty or whitespace messages", () => {
    const messages = {};
    const locale = createLocale(messages);
    locale.setMessage("user", "");
    locale.setMessage("user.name", "Alice"); // Should overwrite empty user string to namespace
    locale.setMessage("user.details", "  \t ");
    locale.setMessage("user.details.age", "30"); // Should overwrite whitespace details to namespace
    expect(locale.getMessages()).toEqual({
      user: {
        name: "Alice",
        details: {
          age: "30",
        },
      },
    });
  });

  it("throws on overlaps for non-empty message", () => {
    const messages = {};
    const locale = createLocale(messages);
    locale.setMessage("user", "existing-value");
    locale.setMessage("user.name", "Alice"); // Fails to overwrite
    expect(() => locale.getMessages()).toThrowError();
  });
});

describe("save", () => {
  it("calls the file.write method", async () => {
    const messages = {
      greeting: "Hello",
      user: {
        name: "Alice",
        friends: ["Bob", { name: "Charlie", age: "20" }],
      },
    };
    const writeMock = jest.fn(async () => void 0);
    const locale = new Locale({
      file: { write: writeMock },
      messages,
      name: "en-US",
      index: 0,
      filePath: "en-US.json",
      format: { sort: "alphabetically", indent: "2" },
    });
    await locale.save();
    expect(writeMock).toHaveBeenCalledTimes(1);
  });

  it("correctly implements sortKeys=alphabetically", async () => {
    const messages = {
      greeting: "Hello",
      user: {
        name: "Alice",
        friends: ["Bob", { name: "Charlie", age: "20" }],
      },
    };
    const writeMock = jest.fn(async () => void 0);
    const locale = new Locale({
      file: { write: writeMock },
      messages,
      name: "en-US",
      index: 0,
      filePath: "en-US.json",
      format: { sort: "alphabetically", indent: "2" },
    });
    await locale.save();
    expect(writeMock).toHaveBeenCalledTimes(1);
    const expectedJsonString = `
{
  "greeting": "Hello",
  "user": {
    "friends": [
      "Bob",
      {
        "age": "20",
        "name": "Charlie"
      }
    ],
    "name": "Alice"
  }
}
    `.trim();

    expect(writeMock).toHaveBeenCalledWith(expectedJsonString);
  });

  it("correctly implements sortKeys=preserver-order-and-append", async () => {
    const messages = {
      user: {
        name: "Alice",
        friends: ["Bob", { name: "Charlie", age: "20" }],
      },
      greeting: "Hello",
    };
    const writeMock = jest.fn(async () => void 0);
    const locale = new Locale({
      file: { write: writeMock },
      messages,
      name: "en-US",
      index: 0,
      filePath: "en-US.json",
      format: { sort: "preserve-order-and-append", indent: "2" },
    });
    locale.setMessage("aaa", "AAA");
    locale.setMessage("user.name", "Charlie");
    locale.setMessage("user.friends.2.age", "21");
    await locale.save();
    expect(writeMock).toHaveBeenCalledTimes(1);
    const expectedJsonString = `
{
  "user": {
    "name": "Charlie",
    "friends": [
      "Bob",
      {
        "name": "Charlie",
        "age": "20"
      },
      {
        "age": "21"
      }
    ]
  },
  "greeting": "Hello",
  "aaa": "AAA"
}
    `.trim();
    expect(writeMock).toHaveBeenCalledWith(expectedJsonString);
  });
});

describe("save with different indent settings", () => {
  function makeMessages(): MessagesObject {
    return { a: "1", b: { c: "2" } };
  }

  it("writes with 2 spaces indent", async () => {
    const messages = makeMessages();
    const writeMock = jest.fn(async () => void 0);
    const locale = new Locale({
      file: { write: writeMock },
      messages,
      name: "en-US",
      index: 0,
      filePath: "en-US.json",
      format: { sort: "alphabetically", indent: "2" },
    });
    await locale.save();
    expect(writeMock).toHaveBeenCalledWith(
      `{
  "a": "1",
  "b": {
    "c": "2"
  }
}`
    );
  });

  it("writes with tab indent", async () => {
    const messages = makeMessages();
    const writeMock = jest.fn(async () => void 0);
    const locale = new Locale({
      file: { write: writeMock },
      messages,
      name: "en-US",
      index: 0,
      filePath: "en-US.json",
      format: { sort: "alphabetically", indent: "tab" },
    });
    await locale.save();
    expect(writeMock).toHaveBeenCalledWith(
      `{
\t"a": "1",
\t"b": {
\t\t"c": "2"
\t}
}`
    );
  });

  it("writes with 4 spaces indent", async () => {
    const messages = makeMessages();
    const writeMock = jest.fn(async () => void 0);
    const locale = new Locale({
      file: { write: writeMock },
      messages,
      name: "en-US",
      index: 0,
      filePath: "en-US.json",
      format: { sort: "alphabetically", indent: "4" },
    });
    await locale.save();
    expect(writeMock).toHaveBeenCalledWith(
      `{
    "a": "1",
    "b": {
        "c": "2"
    }
}`
    );
  });
});
