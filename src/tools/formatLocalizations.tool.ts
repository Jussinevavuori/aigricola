import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { mutateLocaleFiles } from "../utils/localeFiles";
import { toolBasicResponse } from "../utils/toolBasicResponse";

export function register_formatLocalizationsTool(server: McpServer) {
  server.tool(
    "formatLocalizations",
    dedent`
			Format localizations.
    `,
    {},
    async () => {
      // Run no-op to save and format the locale files
      await mutateLocaleFiles(async () => void 0);
      return toolBasicResponse("Succesfully formatted localizations");
    }
  );
}
