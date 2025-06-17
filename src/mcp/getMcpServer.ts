import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { register_listLocalizationsTool } from "../tools/listLocalizations.tool";
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
    { capabilities: { logging: {} } }
  );

  // Register all tools to the server
  register_listLocalizationsTool(server);
  register_updateLocalizationsTool(server);
  register_validateLocalizationsTool(server);

  // Added for extra debuggability
  server.server.onerror = console.error.bind(console);
  return server;
}
