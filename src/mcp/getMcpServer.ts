import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dedent from "dedent";
import { register_listLocalizationsTool } from "../tools/listLocalizations.tool";
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

				RENAMING KEYS
					When asked to rename any keys, you should always prioritize using the
					"renameLocalizationKeys" tool as it will also find & replace your codebase to update
					any references to the old keys.
				
				OTHER UPDATES
					Any other updates should be done using the "updateLocalizations" tool, which can be used
					to add, update or remove keys in your localization files.

				VALIDATING
					When an user asks to validate localizations, you should use the "validateLocalizations"
					tool which automatically detects any issues.

				LISTING MESSAGES
					When working with translations, you can always get the current translations using the
					"listLocalizations" tool. This will return all keys and their current translations.

				Refer to all nested keys using dot notation, e.g. "actions.move" or "say-hello".
				
				You should always prefer using Aigricola over modifying the translation files manually.
				
				You are an expert in localizations.

				When requested to update localizations, always attempt to automatically translate and 
				add the message to every locale in the project.
			`,
    }
  );

  // Register all tools to the server
  register_listLocalizationsTool(server);
  register_updateLocalizationsTool(server);
  register_validateLocalizationsTool(server);
  register_renameLocalizationKeysTool(server);

  // Added for extra debuggability
  server.server.onerror = console.error.bind(console);
  return server;
}
