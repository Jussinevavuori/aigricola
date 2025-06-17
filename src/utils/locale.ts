import JsonStableStringify from "json-stable-stringify";

/**
 * File interface to implement
 */
export interface LocaleFileInterface {
  write(data: string): Promise<unknown>;
}

/**
 * Utility for recursiveness.
 */
type MessageValue = string | MessagesObject | Array<string | MessagesObject>;

/**
 * Type of messages is always a record of string keys to string values, with optional
 * deep nesting in objects and arrays.
 */
export type MessagesObject = { [key: string]: MessageValue };

/**
 * Messages wrapper for modifying messages easily.
 */
export class Locale {
  /**
   * Public locale name.
   */
  public name: string;

  /**
   * Public locale index in the config.
   */
  public index: number;

  /**
   * Public file path.
   */
  public filePath: string;

  /**
   * Private reference to file.
   */
  private file: LocaleFileInterface;

  /**
   * Private deflated messages data.
   */
  private data: Record<string, string>;

  /**
   * Constructors
   */
  constructor(options: {
    file: LocaleFileInterface;
    messages: MessagesObject;
    name: string;
    index: number;
    filePath: string;
  }) {
    // Save data
    this.file = options.file;
    this.name = options.name;
    this.index = options.index;
    this.filePath = options.filePath;

    // Deflate messages into a flat object
    this.data = Locale.deflate(options.messages);
  }

  /**
   * Update self with updated messages.
   */
  async save() {
    const messages = Locale.inflate(this.data);
    const data = JsonStableStringify(messages, {
      space: 2,
      cmp(a, b) {
        return a.key.localeCompare(b.key);
      },
    });
    if (!data) throw new Error("Failed to stringify messages");
    await this.file.write(data);
  }

  /**
   * Utility to get a message by key.
   */
  getMessage(key: string): string | undefined {
    return this.data[key];
  }

  /**
   * Utility to set a message by key.
   */
  setMessage(key: string, value: string): void {
    this.data[key] = value;
  }

  /**
   * Utility to remove a message by key.
   */
  removeMessage(key: string): void {
    if (key in this.data) delete this.data[key];
  }

  /**
   * List all keys in the locale.
   */
  listKeys(): string[] {
    return Object.keys(this.data);
  }

  /**
   * Utility to get all messages as an inflated object.
   */
  getMessages() {
    return Locale.inflate(this.data);
  }

  /**
   * Utility to get all messages as a deflated object.
   */
  getFlatMessages(): Record<string, string> {
    return this.data;
  }

  /**
   * Take a nested object and flatten it into Record<string, string> pairs with
   * dot-notation keys.
   */
  static deflate(messages: MessagesObject): Record<string, string> {
    const result: Record<string, string> = {};
    function walk(obj: MessageValue, path: string[] = []) {
      if (typeof obj === "string") {
        result[path.join(".")] = obj;
      } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => walk(item, [...path, String(idx)]));
      } else if (typeof obj === "object" && obj !== null) {
        for (const key of Object.keys(obj)) {
          walk(obj[key], [...path, key]);
        }
      }
    }
    walk(messages);
    return result;
  }

  /**
   * Opposite of deflate, takes a flat object and expands it into a nested MessagesObject object.
   * Does not use MessageTools.setValue.
   */
  static inflate(flat: Record<string, string>): MessagesObject {
    const result: MessagesObject = {};
    for (const key in flat) {
      const parts = key.split(".");
      let current: any = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];
        const isArrayIndex = !isNaN(Number(nextPart));
        if (!(part in current)) {
          current[part] = isArrayIndex ? [] : {};
        }
        current = current[part];
      }
      const lastPart = parts[parts.length - 1];
      current[lastPart] = flat[key];
    }
    return result;
  }
}
