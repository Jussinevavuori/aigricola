import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { getLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_listLocalesTools(server: McpServer) {
  server.tool(
    "listLocales",
    dedent`
			List all available locales
		`,
    {},
    async () => {
      const locales = (await getLocaleFiles()).map((_) => _.name);
      return toolBasicResponse(JSON.stringify(locales, null, 2));
    }
  );
}
