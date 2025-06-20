import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { getLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_listNamespacesTool(server: McpServer) {
  server.tool(
    "listNamespaces",
    dedent`
			List all available namespaces in the localization files (e.g.
			prefixes like "landingpage.", "pricingpage.", etc.).
		`,
    {},
    async () => {
      // Get all unique namespaces from all locale files
      const namespaces = Array.from(
        // Use set to ensure uniqueness
        new Set(
          // Get all locale files
          (await getLocaleFiles())
            // Extract all keys from each locale
            .flatMap((_) => Object.keys(_.getFlatMessages()))
            // Extract namespaces from each key
            .flatMap((key) => getNamespacesFromKey(key))
        )
      );

      return toolBasicResponse(JSON.stringify(namespaces, null, 2));
    }
  );
}

/**
 * Get all namespaces from a key. For example:
 * `landingpage.hero.title` would return `["landingpage", "landingpage.hero"]`.
 */
function getNamespacesFromKey(key: string): string[] {
  const parts = key.split(".");
  const namespaces: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    namespaces.push(parts.slice(0, i + 1).join("."));
  }
  return namespaces;
}
