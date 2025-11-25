#! /usr/bin/env bun

import { Hono } from "hono";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { getConfig } from "./config/getConfig";
import { mcpRouter } from "./routers/mcp.router";

const app = new Hono();

app.use(logger());
app.use("*", requestId());

app.route("/mcp", mcpRouter);

const port = process.env.AIGRICOLA_PORT || 3031;

getConfig().then((config) => {
  console.clear();
  console.log(`✅ Aigricola running on port ${port}`);
  console.log();
  console.log(`⚙️  Using configuration`);
  console.dir(config);
});

export default Object.assign(app, { port });
