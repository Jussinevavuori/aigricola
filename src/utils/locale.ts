import { Config } from "../config/config.schema";
import { JsonStringify } from "./JsonStringify";

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
   * The inflated messages object. Kept as reference for sorting.
   */
  private initialData: MessagesObject;

  /**
   * JSON formatting options.
   */
  private format: Config["format"];

  /**
   * Constructors
   */
  constructor(options: {
    file: LocaleFileInterface;
    messages: MessagesObject;
    name: string;
    index: number;
    filePath: string;
    format?: Config["format"];
  }) {
    // Save data
    this.file = options.file;
    this.name = options.name;
    this.index = options.index;
    this.filePath = options.filePath;
    this.format = options.format ?? { indent: "2", sort: "alphabetically" };

    // Deflate messages into a flat object
    this.data = Locale.deflate(options.messages);

    // Preserve initial messages object for reference
    this.initialData = options.messages;
  }

  /**
   * Construct initial ordering of keys.
   */
  private getInitialPathsOrdering(obj: MessageValue = this.initialData, path = ""): string[] {
    const paths: string[] = [];

    if (path) paths.push(path);

    if (typeof obj === "object" && obj) {
      for (const key of Object.keys(obj)) {
        const nextPath = path ? `${path}.${key}` : key;
        const value = Array.isArray(obj) ? obj[Number(key)] : obj[key];
        paths.push(...this.getInitialPathsOrdering(value, nextPath));
      }
    }

    return paths;
  }

  /**
   * Implement key sorting algorithm
   */
  private compareKeys<T extends { key: string; path: string; value: unknown }>(a: T, b: T): number {
    switch (this.format.sort) {
      case "alphabetically": {
        return a.key.localeCompare(b.key);
      }
      case "preserve-order-and-append": {
        // Get initial ordering of paths
        const paths = this.getInitialPathsOrdering();

        // Get index or infinity for appending
        const aIndex = paths.indexOf(a.path) === -1 ? Infinity : paths.indexOf(a.path);
        const bIndex = paths.indexOf(b.path) === -1 ? Infinity : paths.indexOf(b.path);

        // When both are being appended, append alphabetically
        if (aIndex === bIndex) return a.path.localeCompare(b.path);

        // Sort by initial ordering
        return aIndex - bIndex;
      }
    }
  }

  /**
   * Get the formatting indentation space based on the indent setting.
   */
  private getSpace() {
    switch (this.format.indent) {
      case "tab":
        return "\t";
      case "2":
        return " ".repeat(2);
      case "4":
        return " ".repeat(4);
    }
  }

  /**
   * Utility to get formatted JSON string with indentation.
   */
  private getFormattedJsonString() {
    return JsonStringify(Locale.inflate(this.data), {
      space: this.getSpace(),
      cmp: this.compareKeys.bind(this),
    });
  }

  /**
   * Update self with updated messages.
   */
  async save() {
    await this.file.write(this.getFormattedJsonString());
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

    // Recursive deflation function
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

    // Start recursion
    walk(messages);

    // Return shallow copy of the flattened result
    return { ...result };
  }

  /**
   * Opposite of deflate, takes a flat object and expands it into a nested MessagesObject object.
   * Does not use MessageTools.setValue.
   */
  static inflate(flat: Record<string, string>): MessagesObject {
    // Setup result object for inflation
    const result: MessagesObject = {};

    // Inflate each key
    for (const key in flat) {
      // Current namespace object
      let current: any = result;

      // For all namespaces (all but last part of key), traverse
      // to namespace and create namespaces if they don't exist.
      const parts = key.split(".");
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];
        const isArrayIndex = !isNaN(Number(nextPart));
        if (!(part in current)) {
          current[part] = isArrayIndex ? [] : {};
        } else if (typeof current[part] === "string") {
          // If the current value is a string, only overwrite if it's empty or whitespace
          if (typeof current[part] === "string" && current[part].trim() === "") {
            current[part] = isArrayIndex ? [] : {};
          } else {
            throw new Error(
              `Cannot inflate key "${key}": "${parts
                .slice(0, i + 1)
                .join(".")}" is already a string value ("${
                current[part]
              }") and cannot be overwritten with an object or array.`
            );
          }
        }
        current = current[part];
      }

      // Add key to resolved namespace
      const lastPart = parts[parts.length - 1];
      current[lastPart] = flat[key];
    }

    // Return inflated object
    return result;
  }
}
