import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import c from "chalk";
import dedent from "dedent";
import { z } from "zod";
import { getConfig } from "../config/getConfig";
import { findAndReplaceCodebase } from "../utils/findAndReplace";
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
      const config = await getConfig();

      const appliedMappings: Record<string, string> = {};

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

            appliedMappings[sourceKey] = targetKey; // Track the mapping for find and replace
          }
        }
      });

      // Find and replace all applied matches if enabled
      const fnr = config.findAndReplace;
      if (fnr.enabled) {
        for (const [oldKey, newKey] of Object.entries(appliedMappings)) {
          await findAndReplaceCodebase({
            baseDir: fnr.baseDir,
            exclude: fnr.exclude,
            include: fnr.include,
            find: new RegExp(fnr.keyRegex.replace("__TRANSLATION_KEY__", oldKey)),
            replaceWith: { key: newKey },
          });
        }
      }

      return toolBasicResponse("Succesfully added localizations");
    }
  );
}
