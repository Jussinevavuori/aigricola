type Key = string | number;
type Node = Record<string, unknown> | unknown[] | null;

interface CmpEntry {
  key: string;
  value: unknown;
  path: string;
}

interface Options {
  space?: number | string;
  cycles?: boolean;
  collapseEmpty?: boolean;
  cmp?: (a: CmpEntry, b: CmpEntry) => number;
}

function buildPath(path: Key, key: Key): string {
  return path ? `${path}.${key}` : key.toString();
}

/**
 * Modified and simplified version of `json-stable-stringify`.
 *
 * - Converted to modern TypeScript without dependencies
 * - Removed support for replacers
 *
 * Extra features (reasons for using custom version):
 *
 * - Added `path` to CmpEntry for improved sorting
 *
 * Original:
 * https://github.com/ljharb/json-stable-stringify/blob/main/index.js
 */
export function JsonStringify(obj: unknown, opts: Options = {}): string {
  const space = typeof opts.space === "number" ? " ".repeat(opts.space) : opts.space ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seen = new Set<any>();

  function stringify(
    parent: Node,
    key: Key,
    node: unknown,
    level: number,
    path: string
  ): string | undefined {
    const indent = space ? "\n" + space.repeat(level) : "";
    const colonSeparator = space ? ": " : ":";

    if (node && typeof (node as any).toJSON === "function") {
      node = (node as any).toJSON();
    }

    if (node === undefined) return;
    if (typeof node !== "object" || node === null) {
      return JSON.stringify(node);
    }

    const groupOutput = (out: string[], brackets: "[]" | "{}"): string => {
      return opts.collapseEmpty && out.length === 0
        ? brackets
        : (brackets === "[]" ? "[" : "{") +
            out.join(",") +
            indent +
            (brackets === "[]" ? "]" : "}");
    };

    if (Array.isArray(node)) {
      const out: string[] = [];
      for (let i = 0; i < node.length; i++) {
        const item =
          stringify(node, i, node[i], level + 1, buildPath(path, i)) ?? JSON.stringify(null);
        out.push(indent + space + item);
      }
      return groupOutput(out, "[]");
    }

    if (seen.has(node)) {
      if (opts.cycles) return JSON.stringify("__cycle__");
      throw new TypeError("Converting circular structure to JSON");
    }
    seen.add(node);

    let keys = Object.keys(node);
    if (opts.cmp) {
      const nodeRecord = node as Record<string, unknown>;
      keys = keys.sort((a, b) =>
        opts.cmp!(
          { key: a, value: nodeRecord[a], path: buildPath(path, a) },
          { key: b, value: nodeRecord[b], path: buildPath(path, b) }
        )
      );
    }

    const out: string[] = [];

    for (const key of keys) {
      const value = stringify(
        node as Record<string, unknown>,
        key,
        (node as Record<string, unknown>)[key],
        level + 1,
        buildPath(path, key)
      );
      if (!value) continue;

      const keyValue = JSON.stringify(key) + colonSeparator + value;
      out.push(indent + space + keyValue);
    }

    seen.delete(node);
    return groupOutput(out, "{}");
  }

  return stringify({ "": obj }, "", obj, 0, "") as string;
}
