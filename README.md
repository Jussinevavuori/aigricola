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

**🚨 NOTE: You should always `git commit` before running any changes with `aigricola`. I take no responsibility for any issues or lost work caused by using a work-in-progress OSS tool.**

1. Setup: [Install `bun`](https://bun.sh/docs/installation)
   - Quick install: `curl -fsSL https://bun.sh/install | bash`
2. Setup Aigricola CLI
   1. Clone repo: `git clone ...`
   2. `cd aigricola` to your repo
   3. Run `bun install`
   4. Run `bun link`
   5. Run `bun link aigricola`
3. Setup your project
   1. Add `aigricola.json` (instructions below).
   2. Run the server with `aigricola` in your folder.
   3. Register Aigricola MCP server to Copilot.
      1. Select `Configure tools...`
      2. Select `Add more tools`
      3. Select `Add MCP server`
      4. Select `HTTP`
      5. Enter `http://localhost:3031` as URL
      6. Enter `aigricola` as name
4. Start prompting

## ⚙️ Configuration `aigricola.json`

For configuring the behaviour of Aigricola in your project.

### Minimal example

Start with this configuration.

```json
{
  "locales": ["messages/en-US.json", "messages/fi.json"],
  "findAndReplace": {
    "enabled": true
  }
}
```

### Full example

When more control is required, see this example.

```json
{
  "locales": ["messages/en-US.json", "messages/fi.json"],
  "sortKeys": "alphabetically",
  "findAndReplace": {
    "enabled": true,
    "baseDir": ".",
    "include": ["**/*.json", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    "exclude": ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    "keyRegex": "(t(?:\\.rich)?\\s*\\(\\s*[\"'`])(?<key>__TRANSLATION_KEY__)([\"'`])"
  }
}
```

| Option                    | Description                           | Default                                                   |
| ------------------------- | ------------------------------------- | --------------------------------------------------------- |
| `locales`                 | List of locale files [0]              | **Required**                                              |
| `sortKeys`                | How to sort keys in translation files | `alphabetically` (default) or `preserve-order-and-append` |
| `findAndReplace.enabled`  | Enable/disable find & replace         | **Required**                                              |
| `findAndReplace.baseDir`  | Directory to search                   | `.`                                                       |
| `findAndReplace.include`  | Glob patterns to include              | All `.ts(x)` and `.js(x)` files.                          |
| `findAndReplace.exclude`  | Glob patterns to exclude              | `node_modules`, `.next`, `dist`                           |
| `findAndReplace.keyRegex` | Regex for translation key usage [1]   | Smart regex                                               |

[0]: The first locale is used as the "source" locale.
[1]: If custom regex is used, it must include the following capture group: `(?<key>__TRANSLATION_KEY__)` that represents the key literal.

## 🛠️ Customizing behaviour

- **Change port**: Default port is `3031`. Override by setting `AIGRICOLA_PORT` in your `.env`.

## 💡 Example prompts

To update your translation structure with automatic codebase find and replace.

> Copilot dearest, using Aigricola, move all action verb translations ("create", "archive", "confirm") to the "actions" namespace (e.g. "actions.create"...).

To validate and auto-fix your translations.

> Copilot dearest, using Aigricola, find and fix any errors in my translations.

## 🧰 Implementation

| Component                   | Description                          |
| --------------------------- | ------------------------------------ |
| `hono`                      | Web server framework                 |
| `@modelcontextprotocol/sdk` | MCP server & protocol implementation |
| `bun`                       | Runtime                              |
