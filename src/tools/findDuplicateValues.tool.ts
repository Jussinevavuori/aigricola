import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import c from "chalk";
import dedent from "dedent";
import { getLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_findDuplicateValuesTool(server: McpServer) {
  server.tool(
    "findDuplicateValues",
    dedent`
		  Find duplicate values in localizations and report them.

			When reporting, format as table where the columns are:
			- Locale: The name of the locale where the duplicates were found.
			- Message: The message that was duplicated.
			- Keys: The keys that had the same value.
		`,
    {},
    async () => {
      const locales = await getLocaleFiles();

      /**
       * To ensure nearly similar values are counted as duplicates, normalize them.
       */
      function normalizeMessage(message: string): string {
        return message
          .toLowerCase()
          .trim() // Trim leading and trailing whitespace
          .replace(/[\s]+/g, "-") // Replace all whitespace with a single dash
          .replace(/[^a-z0-9åäö_-]/g, ""); // Remove non-alphanumeric characters except å, ä, ö, dashes, and underscores
      }

      /**
       * Collect all issues found during the validation.
       */
      const issues: string[] = [];

      // Loop over every locale
      for (const locale of locales) {
        /**
         * Register the number of all occurrences of each message.
         *
         * { [NormalizedMessage]: { [Key]: OriginalMesssage } }
         */
        const register = new Map<string, Record<string, string>>();
        for (const [key, original] of Object.entries(locale.getFlatMessages())) {
          const normal = normalizeMessage(original);
          register.set(normal, Object.assign(register.get(normal) || {}, { [key]: original }));
        }

        /**
         * Report all duplicates found in the register.
         */
        for (const [normalized, entries] of register.entries()) {
          if (Object.keys(entries).length <= 1) continue; // Skip if no duplicates
          issues.push(
            [
              `Message "${normalized}`,
              `found ${Object.keys(entries).length} times`,
              `in "${locale.name}"`,
              `as keys:`,
              Object.keys(entries)
                .map((_) => `"${_}"`)
                .join(", "),
            ].join(" ")
          );
        }
      }

      // Log issues
      console.log(
        issues.length === 0
          ? c.green("✅ All localizations OK, no duplicates found.")
          : c.red(`🚨 Found ${issues.length} duplicates`)
      );
      for (const issue of issues) {
        console.log(c.gray(`  - ${issue}`));
      }

      // Report issues
      return toolBasicResponse(
        issues.length === 0
          ? "No duplicates found."
          : `Found ${issues.length} duplicates:\n\n${issues.join("\n")}`
      );
    }
  );
}
