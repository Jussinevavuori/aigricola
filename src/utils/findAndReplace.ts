import fg from "fast-glob";
import { readFile, writeFile } from "fs/promises";

/**
 * Utility function to replace text in a string.
 *
 * - If replaceWith is a string, replaces as before.
 * - If replaceWith is a Record<string, string>, replaces named capture groups with the corresponding value.
 */
export function findAndReplaceText(opts: {
  content: string;
  find: string | RegExp;
  replaceWith: string | Record<string, string>;
}): string {
  // String literal replacement
  if (typeof opts.find === "string") {
    // If replaceWith is a Record, string find doesn't make sense for named groups
    if (typeof opts.replaceWith !== "string") {
      throw new Error(
        "If using a Record for replaceWith, find must be a RegExp with named capture groups."
      );
    }

    return opts.content.split(opts.find).join(opts.replaceWith);
  }

  // RegExp replacement
  return opts.content.replace(opts.find, (...args) => {
    const groups = args[args.length - 1]; // named capture groups if any

    // Replace with string literal
    if (typeof opts.replaceWith === "string") {
      return opts.replaceWith;
    }

    // opts.replaceWith is a Record<string, string>: replace named groups
    if (groups && typeof groups === "object") {
      let replaced = args[0]; // the full match
      for (const [group, value] of Object.entries(opts.replaceWith)) {
        if (groups[group] !== undefined) {
          // Replace the group value in the match with the replacement value
          // This is a simple approach: replace the first occurrence of the group value in the match
          replaced = replaced.replace(groups[group], value);
        }
      }
      return replaced;
    }

    // If no named groups, just return the match
    return args[0];
  });
}

/**
 * Utility function to replace text in a single file.
 */
export async function findAndReplaceFile(opts: {
  fileName: string;
  find: string | RegExp;
  replaceWith: string | Record<string, string>;
  dryRun: boolean;
}) {
  const original = await readFile(opts.fileName, "utf-8");
  const replaced = findAndReplaceText({
    content: original,
    find: opts.find,
    replaceWith: opts.replaceWith,
  });

  if (original !== replaced) {
    console.log(`${opts.dryRun ? "[DRY-RUN] " : ""}Updated: ${opts.fileName}`);
    if (!opts.dryRun) await writeFile(opts.fileName, replaced);
  }
}

/**
 * Utility function to find and replace text in files within a directory.
 */
export async function findAndReplaceCodebase(opts: {
  baseDir: string;
  find: string | RegExp;
  replaceWith: string | Record<string, string>;
  include: string[];
  exclude?: string[];
  dryRun?: boolean;
}) {
  // Use include / exclude glob patterns to find all files for find & replace
  const files = await fg(opts.include, {
    cwd: opts.baseDir,
    ignore: opts.exclude,
    absolute: true,
  });

  // Run find and replace on each file
  await Promise.all(
    files.map((fileName) =>
      findAndReplaceFile({
        fileName,
        find: opts.find,
        replaceWith: opts.replaceWith,
        dryRun: opts.dryRun || false,
      })
    )
  );
}
