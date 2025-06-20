import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { register_addLocalizationsTool } from "../tools/addLocalizations.tool";
import { register_copyLocalizationsTool } from "../tools/copyLocalizations.tool";
import { register_findDuplicateValuesTool } from "../tools/findDuplicateValues.tool";
import { register_formatLocalizationsTool } from "../tools/formatLocalizations.tool";
import { register_listLocalesTools } from "../tools/listLocales.tool";
import { register_listLocalizationKeysTool } from "../tools/listLocalizationKeys";
import { register_listLocalizationsTool } from "../tools/listLocalizations.tool";
import { register_listNamespacesTool } from "../tools/listNamespaces.tool";
import { register_removeLocalizationsTool } from "../tools/removeLocalizations.tool";
import { register_renameLocalizationKeysTool } from "../tools/renameLocalizationKeys.tool";
import { register_updateLocalizationsTool } from "../tools/updateLocalizations.tool";
import { register_validateLocalizationsTool } from "../tools/validateLocalizations.tool";

/**
 * Utility function to create a new MCP server instance.
 */
export function getMcpServer() {
  // Create an MCP server
  const server = new McpServer(
    {
      name: "Aigricola Localization Manager",
      version: "1.0.0",
    },
    {
      capabilities: { logging: {} },
      instructions: dedent`
				This server provides tools for managing localizations, translations and messages in
				your project.
				
				Refer to all nested keys using dot notation, e.g. "actions.move" or "say-hello".
			`,
    }
  );

  // Register all tools to the server
  register_listLocalesTools(server);
  register_listNamespacesTool(server);
  register_addLocalizationsTool(server);
  register_listLocalizationsTool(server);
  register_copyLocalizationsTool(server);
  register_formatLocalizationsTool(server);
  register_updateLocalizationsTool(server);
  register_findDuplicateValuesTool(server);
  register_removeLocalizationsTool(server);
  register_listLocalizationKeysTool(server);
  register_validateLocalizationsTool(server);
  register_renameLocalizationKeysTool(server);

  // Added for extra debuggability
  server.server.onerror = console.error.bind(console);
  return server;
}
