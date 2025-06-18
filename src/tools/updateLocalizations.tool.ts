import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { z } from "zod";
import { mutateLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_updateLocalizationsTool(server: McpServer) {
  server.tool(
    "updateLocalizations",
    dedent`
		  Update localizations to the locale files. Enables updating multiple keys to multiple locales at once.

      {
				"keys": {
					"instructions.title": {
						"en-US": "Instructions",
						"fi-FI": "Ohjeet"
					},
					"instructions.subtitle": {
						"en-US": "Learn how to use this tool",
						"fi-FI": "Opi käyttämään tätä työkalua"
					}
				}
      }
    `,
    {
      keys: z.record(z.string(), z.record(z.string(), z.string())),
    },
    async ({ keys }) => {
      await mutateLocaleFiles(async (locales) => {
        for (const [key, values] of Object.entries(keys)) {
          for (const [localeName, message] of Object.entries(values)) {
            const locale = locales.find((_) => _.name === localeName);
            if (locale) {
              locale.setMessage(key, message);
              console.log(`✅ Update ${key} (${localeName}): ${message}`);
            }
          }
        }
      });

      return toolBasicResponse("Succesfully updated localizations");
    }
  );
}
