import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { getLocaleFiles } from "../utils/localeFiles";

export function register_listLocalizationsTool(server: McpServer) {
  server.tool(
    "listLocalizations",
    dedent`
			List all available locales and messages
		`,
    {},
    async () => {
      const locales = await getLocaleFiles();

      const messages = Object.fromEntries(
        locales.map((locale) => [
          locale.name,
          {
            $$messages: locale.getFlatMessages(),
            $$metadata: {
              name: locale.name,
              index: locale.index,
              filePath: locale.filePath,
            },
          },
        ])
      );

      return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
    }
  );
}
