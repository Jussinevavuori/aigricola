import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { getLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_listLocalizationKeysTool(server: McpServer) {
  server.tool(
    "listLocalizationKeys",
    dedent`
			List all available localization keys
		`,
    {},
    async () => {
      const locales = await getLocaleFiles();

      const keys = Array.from(
        new Set<string>(locales.flatMap((locale) => Object.keys(locale.getFlatMessages())))
      );

      return toolBasicResponse(JSON.stringify(keys, null, 2));
    }
  );
}
