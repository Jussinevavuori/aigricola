import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLocaleFiles } from "../utils/localeFiles";

/**
 * Validate localizations and report all issues.
 */
export function register_validateLocalizationsTool(server: McpServer) {
  server.tool(
    "validateLocalizations",
    "Validate localizations and report all issues",
    {},
    async () => {
      const locales = await getLocaleFiles();

      // Source keys
      const sourceLocale = locales.find((_) => _.index === 0);
      const sourceKeys = sourceLocale ? sourceLocale.listKeys() : [];

      // Find all issues in localizations
      const issues: string[] = [];
      for (const locale of locales) {
        // Find any missing keys (when compared to the source locale)
        sourceKeys
          .filter((k) => locale.getMessage(k) === undefined)
          .forEach((k) =>
            issues.push(
              `Missing key "${k}" in locale "${locale.name}" (should be added with automatic translation)`
            )
          );

        // Find any empty keys
        sourceKeys
          .filter((k) => locale.getMessage(k) === "")
          .forEach((k) => {
            issues.push(
              `Missing key "${k}" in locale "${locale.name}" (should be filled with automatic translation)`
            );
          });

        // Find any extra keys (not in the source locale)
        locale
          .listKeys()
          .filter((k) => !sourceKeys.includes(k))
          .forEach((k) => {
            issues.push(`Extra key "${k}" in locale "${locale.name}" (should be removed)`);
          });
      }

      // No issues found
      if (issues.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "All localizations OK, no issues found.",
            },
          ],
        };
      }

      // List found issues
      return {
        content: [
          {
            type: "text",
            text: `Found ${issues.length} issues:\n\n${issues.join("\n")}`,
          },
        ],
      };
    }
  );
}
