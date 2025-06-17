#! /usr/bin/env bun

import { Hono } from "hono";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { mcpRouter } from "./routers/mcp.router";

const app = new Hono();

app.use(logger());
app.use("*", requestId());

app.route("/mcp", mcpRouter);

export default Object.assign(app, { port: process.env.AIGRICOLA_PORT || 3031 });
