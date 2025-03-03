# Delay Doomsday MCP Server

## Features

### Tools

- `create_note` - Create new text notes
  - Takes title and content as required parameters
  - Stores note in server state

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-server-delay-doomsday": {
      "command": "/path/to/mcp-server-delay-doomsday/build/index.js"
    }
  }
}
```
