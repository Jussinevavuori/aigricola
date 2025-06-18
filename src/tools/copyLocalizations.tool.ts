import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import c from "chalk";
import dedent from "dedent";
import { z } from "zod";
import { mutateLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_copyLocalizationsTool(server: McpServer) {
  server.tool(
    "copyLocalizations",
    dedent`
			Copy an existing localization to a new key.

      {
				"keys": {
					"landingpage.title": "pricingpage.title",
					"landingpage.subtitle": "pricingpage.subtitle"
				}
      }
    `,
    {
      keys: z.record(z.string(), z.string()),
    },
    async ({ keys }) => {
      await mutateLocaleFiles(async (locales) => {
        for (const [sourceKey, targetKey] of Object.entries(keys)) {
          for (const locale of locales) {
            const message = locale.getMessage(sourceKey);

            if (!message) {
              console.warn(`⚠️ Key ${c.bold(sourceKey)} not found in ${c.bold(locale.name)}`);
              continue;
            }

            locale.setMessage(targetKey, message);
            console.log(`✅ Copied ${c.bold(sourceKey)} to ${c.bold(targetKey)} (${locale.name})`);
          }
        }
      });

      return toolBasicResponse("Succesfully added localizations");
    }
  );
}
