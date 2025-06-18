import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { z } from "zod";
import { getConfig } from "../config/getConfig";
import { findAndReplaceCodebase } from "../utils/findAndReplace";
import { mutateLocaleFiles } from "../utils/localeFiles";

export function register_renameLocalizationKeysTool(server: McpServer) {
  server.tool(
    "renameLocalizationKeys",
    dedent`
			Rename localization keys. Prefer this over the "updateLocalizations" tool for renaming,
			moving and refactoring keys as this also applies find and replace to all keys in the codebase.
			
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

      await mutateLocaleFiles(async (locales) => {
        for (const [oldKey, newKey] of Object.entries(mappings)) {
          // Move key in all locales
          for (const locale of locales) {
            const message = locale.getMessage(oldKey) ?? "";
            locale.setMessage(newKey, message);
            locale.removeMessage(oldKey);
          }

          // Find and replace
          const fnr = config.findAndReplace;
          if (fnr.enabled) {
            findAndReplaceCodebase({
              baseDir: fnr.baseDir,
              exclude: fnr.exclude,
              include: fnr.include,
              find: new RegExp(fnr.keyRegex.replace("__TRANSLATION_KEY__", oldKey)),
              replaceWith: { key: newKey },
            });
          }
        }
      });

      return { content: [{ type: "text", text: "OK" }] };
    }
  );
}
