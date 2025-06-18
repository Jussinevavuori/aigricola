import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { z } from "zod";
import { mutateLocaleFiles } from "../utils/localeFiles";

export function register_addLocalizationsTool(server: McpServer) {
  server.tool(
    "updateLocalizations",
    dedent`
		  Add localizations to the locale files. Enables adding multiple keys to multiple locales at once.

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
            locale?.setMessage(key, message);
          }
        }
      });

      return { content: [{ type: "text", text: "OK" }] };
    }
  );
}
