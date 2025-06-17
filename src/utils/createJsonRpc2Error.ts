/**
 * Utility function to create a JSON-RPC 2.0 error response.
 */
export function JsonRpc2Error(
  code: number,
  message: string,
  data?: unknown
): { jsonrpc: string; error: { code: number; message: string; data?: unknown }; id: null } {
  return {
    jsonrpc: "2.0",
    error: {
      code,
      message,
      data,
    },
    id: null,
  };
}
