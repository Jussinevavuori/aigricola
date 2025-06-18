import { Config } from "../config/config.schema";
import { getConfig } from "../config/getConfig";
import { Locale, MessagesObject } from "./locale";

/**
 * Utility to open a single file.
 */
export async function getLocaleFile(filePath: string) {
  // Get config
  const config = await getConfig();

  // Open the file
  const file = Bun.file(filePath);
  const messages = (await file.json()) as MessagesObject;
  const name = (filePath.split("/").pop() ?? "")?.replace(/\.json$/, "");
  const index = config.locales.indexOf(filePath);

  // Initialize a new locale
  return new Locale({ file, messages, name, index, filePath });
}

/**
 * Fetch all locale files
 */
export function getLocaleFiles() {
  return getConfig().then((config) => Promise.all(config.locales.map(getLocaleFile)));
}

/**
 * Mutate locale files with a callback function and automatically commit
 * changes.
 */
export async function mutateLocaleFiles<T>(
  fn: (localeFiles: Locale[], config: Config) => Promise<T>
) {
  // Fetch data
  const config = await getConfig();
  const locales = await getLocaleFiles();

  // Run callback. Allowed to mutate `locales.[i].json`.
  const result = await fn(locales, config);

  // Save all locale files with updated contents. Ensure to sort keys for consistency.
  await Promise.allSettled(locales.map(async (locale) => await locale.save()));

  return result;
}
