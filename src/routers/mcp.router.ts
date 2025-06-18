import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { Hono } from "hono";
import { getMcpServer } from "../mcp/getMcpServer";
import { JsonRpc2Error } from "../utils/createJsonRpc2Error";

/**
 * Setup new router
 */
export const mcpRouter = new Hono();

/**
 * Handle POST requests to the MCP endpoint.
 */
mcpRouter.post("/", async (c) => {
  // Convert Hono request to request/response objects
  const { req, res } = toReqRes(c.req.raw);

  try {
    // Initialize transport
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    transport.onerror = console.error.bind(console);

    // Initialize server and connect to transport
    const server = getMcpServer();
    await server.connect(transport);

    // Handle the request using the transport
    await transport.handleRequest(req, res, await c.req.json());

    // Close transport and server on response close
    res.on("close", () => {
      transport.close();
      server.close();
    });

    // Return as correctly shaped response
    return toFetchResponse(res);
  } catch (e) {
    console.error(e);
    return c.json(JsonRpc2Error(-32603, "Internal server error"), { status: 500 });
  }
});

// Disallow other methods on MCP endpoint
mcpRouter.get("/", (c) => c.json(JsonRpc2Error(-32600, "Method not allowed."), { status: 405 }));
mcpRouter.put("/", (c) => c.json(JsonRpc2Error(-32600, "Method not allowed."), { status: 405 }));
mcpRouter.delete("/", (c) => c.json(JsonRpc2Error(-32600, "Method not allowed."), { status: 405 }));
mcpRouter.patch("/", (c) => c.json(JsonRpc2Error(-32600, "Method not allowed."), { status: 405 }));
