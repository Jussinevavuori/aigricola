import { z } from "zod";

/**
 * Locale file regex. Must be any path to a `${localeRegex}.json` file.
 */
const localeFileRegex = /^.+\/([a-z]{2}(?:-[A-Z]{2})?)\.json$/;

/**
 * Type of config file.
 */
export const ConfigSchema = z.object({
  /**
   * Relative to the config schema, paths to each locale file. The first one is considered the
   * source locale.
   */
  locales: z
    .string()
    .regex(localeFileRegex, "Invalid locale file name.")
    .array()
    .nonempty("At least one locale is required."),

  /**
   * All JSON formatting options.
   */
  format: z
    .object({
      /**
       * Key sorting
       *
       * - alphabetically:               Keys are always sorted alphabetically.
       * - alphabetically-objects-first: Keys are sorted alphabetically, but objects are sorted first.
       * - preserve-order-and-append:    The initial order of the keys is preserved, and new keys are
       *                                 appended at the end of each namespace.
       */
      sort: z
        .enum(["alphabetically", "alphabetically-objects-first", "preserve-order-and-append"])
        .default("alphabetically"),

      /**
       * Indent for formatting JSON files.
       *
       * - `tab`: Use tab characters for indentation.
       * - `2`:   Use 2 spaces for indentation.
       * - `4`:   Use 4 spaces for indentation.
       */
      indent: z.enum(["tab", "2", "4"]).default("2"),
    })
    .default({
      sort: "alphabetically",
      indent: "2",
    }),

  /**
   * Find + replace
   */
  findAndReplace: z.object({
    /**
     * Is find and replace enabled?
     */
    enabled: z.boolean(),

    /**
     * Base directory relative to the config file where to search for files.
     */
    baseDir: z.string().default("."),

    /**
     * Glob pattern for files to search in.
     */
    include: z
      .string()
      .array()
      .default([
        "**/*.ts",
        "**/*.tsx",
        "**/*.js",
        "**/*.jsx",
        "**/*.vue",
        "**/*.svelte",
        "**/*.html",
      ]),

    /**
     * Glob pattern for files to exclude from search.
     */
    exclude: z.string().array().default([
      // Default excludes for common directories
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/public/**",
    ]),

    /**
     * Regex pattern for applied translations.
     *
     * Default:
     * - Assumes `t()` or `t.rich()` calls.
     * - Allows all quotes.
     * - Allows any whitespace.
     *
     * The regex must include the capture group `(?<key>__TRANSLATION_KEY__)` which is used to
     * replace the translation key.
     */
    keyRegex: z
      .string()
      .regex(/(?<key>__TRANSLATION_KEY__)/)
      .default(`(t(?:\\.rich)?\\s*\\(\\s*["'\`])(?<key>__TRANSLATION_KEY__)(["'\`])`),
  }),
});

/**
 * Type of config file.
 */
export type Config = z.infer<typeof ConfigSchema>;
