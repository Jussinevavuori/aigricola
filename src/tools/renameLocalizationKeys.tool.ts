import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import c from "chalk";
import dedent from "dedent";
import { z } from "zod";
import { getConfig } from "../config/getConfig";
import { findAndReplaceCodebase } from "../utils/findAndReplace";
import { mutateLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_renameLocalizationKeysTool(server: McpServer) {
  server.tool(
    "renameLocalizationKeys",
    dedent`
			Rename localization keys. Prefer this over the "updateLocalizations" tool for renaming,
			moving and refactoring keys as this also applies find and replace to all keys in the codebase.

			Also supports renaming namespaces with partial "startsWith" matches, e.g.
			renaming "HomePage." to "LandingPage". will rename all keys starting with "HomePage."
			to start with "LandingPage.".
			
			Automatically updates all localization files with the provided key-mappings.

			Example input { oldkey: newkey }:

			{
				"move": "actions.move",
				"rename": "actions.rename",
				"greeting": "say-hello"
			}
		`,
    { mappings: z.record(z.string(), z.string()) },
    async ({ mappings }) => {
      const config = await getConfig();

      const appliedMappings: Record<string, string> = {};

      await mutateLocaleFiles(async (locales) => {
        for (const [oldKeyStart, newKeyStart] of Object.entries(mappings)) {
          // Move key in all locales
          for (const locale of locales) {
            // Find all matching keys that start with "oldKey"
            const keysToUpdate = Object.keys(locale.getFlatMessages()).filter((key) =>
              key.startsWith(oldKeyStart)
            );

            // Warn if no matched keys
            if (!keysToUpdate.length) {
              console.warn(`⚠️ No keys match ${c.bold(oldKeyStart)} in ${c.bold(locale.name)}`);
              continue;
            }

            // Rename each matched key
            for (const oldKey of keysToUpdate) {
              const newKey = oldKey.replace(oldKeyStart, newKeyStart);
              const message = locale.getMessage(oldKey) ?? "";
              locale.setMessage(newKey, message);
              locale.removeMessage(oldKey);
              appliedMappings[oldKey] = newKey; // Track the mapping for find and replace
              console.log(`✅ Renamed ${c.bold(oldKey)} to ${c.bold(newKey)}`);
            }
          }
        }
      });

      // Find and replace all applied matches if enabled
      const fnr = config.findAndReplace;
      if (fnr.enabled) {
        Object.entries(appliedMappings).forEach(async ([oldKey, newKey]) => {
          await findAndReplaceCodebase({
            baseDir: fnr.baseDir,
            exclude: fnr.exclude,
            include: fnr.include,
            find: new RegExp(fnr.keyRegex.replace("__TRANSLATION_KEY__", oldKey)),
            replaceWith: { key: newKey },
          });
        });
      }

      return toolBasicResponse("Succesfully renamed localizations");
    }
  );
}
