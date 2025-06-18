import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { z } from "zod";
import { mutateLocaleFiles } from "../utils/localeFiles";

export function register_removeLocalizationsTool(server: McpServer) {
  server.tool(
    "removeLocalizations",
    dedent`
			Remove localization keys entire from all locale files.

      {
				"keys": ["instructions.title", "instructions.subtitle"]
      }
    `,
    {
      keys: z.string().array(),
    },
    async ({ keys }) => {
      await mutateLocaleFiles(async (locales) => {
        for (const key of keys) {
          for (const locale of locales) {
            locale.removeMessage(key);
          }
        }
      });

      return { content: [{ type: "text", text: "OK" }] };
    }
  );
}
