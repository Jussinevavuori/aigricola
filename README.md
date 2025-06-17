**⚠️ WARNING -- WORK IN PROGRESS ⚠️**

# 🌍 MCP localization utility

I hate translating applications and managing keys.

But I have a bit of free time and VSCode Github Copilot.

This is a tool I'm working on to make translating applications and managing translation keys easier. It is implemented as an **MCP Server** that exposes tools

## 📄 License

MIT license. Copyright (C) 2025 Jussi Nevavuori.

## 🚧 Status

Extremely work in progress.

## 🚀 Usage

Clone the repo. Add an `aigricola.json` config file. Run the `aigricola` server on your project (instructions upcoming). Register `aigricola` as a tool for Github Copilot (or any other MCP client). Happy prompting.

## 💡 Example prompts

To update your translation structure with automatic codebase find and replace.

> Copilot dearest, using Aigricola, move all action verb translations ("create", "archive", "confirm") to the "actions" namespace (e.g. "actions.create"...).

To validate and auto-fix your translations.

> Copilot dearest, using Aigricola, find and fix any errors in my translations.

## 🛠️ Implementation

| Component                   | Description                          |
| --------------------------- | ------------------------------------ |
| `hono`                      | Web server framework                 |
| `@modelcontextprotocol/sdk` | MCP server & protocol implementation |
| `bun`                       | Runtime                              |
