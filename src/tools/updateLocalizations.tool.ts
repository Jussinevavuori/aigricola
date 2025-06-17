import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mutateLocaleFiles } from "../utils/localeFiles";

/**
 * Enable updating localizations with a list of actions.
 */
export function register_updateLocalizationsTool(server: McpServer) {
  server.tool(
    "updateLocalizations",
    `
      Update localizations with a list of changes to make. Reference keys with dot notation.

			Example input:

      {
        "changes": {
          "en-US": {
            "set": {
              "game.title": "Aigricola",
              "game.description": "A farming game",
							"game.new-key: "Value from old key"
            },
            "remove": [
              "game.paragraphs.1",
              "game.paragraphs.2",
							"game.old-key"
            ],
          }
        }
      }
    `,
    {
      actions: z.record(
        z.string(), // Locale name
        z.object({
          set: z.record(z.string(), z.string()), // Key-value pairs to set
          remove: z.array(z.string()), // Keys to remove
        })
      ),
    },
    async ({ actions }) => {
      await mutateLocaleFiles(async (locales) => {
        for (const [localeName, changes] of Object.entries(actions)) {
          // Find correct locale
          const locale = locales.find((_) => _.name === localeName);
          if (!locale) continue;

          // Apply set actions
          for (const [key, message] of Object.entries(changes.set || {})) {
            console.log(`> 🔥 SET (${localeName}) — ${key}: ${message}`);
            locale.setMessage(key, message);
          }

          // Apply remove actions
          for (const key of changes.remove || []) {
            console.log(`> 🔥 REMOVE (${localeName}) — ${key}`);
            locale.removeMessage(key);
          }
        }
      });

      return { content: [{ type: "text", text: "OK" }] };
    }
  );
}
