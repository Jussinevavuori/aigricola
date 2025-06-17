/**
 * A config file should be passed in to the arguments as `--config=path/to/config.json`. Find and
 * open the file, verify its contents.
 *
 * Config path defaults to `./aigricola.json`
 */

import { ConfigSchema } from "./config.schema";

export async function getConfig() {
  const path = getConfigPathArgument();
  const file = Bun.file(path);
  const json = await file.json();
  return ConfigSchema.parse(json);
}

function getConfigPathArgument() {
  const args = process.argv.slice(2);
  const configArg = args.find((arg) => arg.startsWith("--config="));
  if (configArg) {
    const value = configArg.split("=")?.[1]?.trim();
    if (value) return value;
  }
  return "./aigricola.json"; // Default path
}
