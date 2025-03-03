# Delay Doomsday MCP Server

I present to you the first of its kind in the entire MCP scene—an MCP server designed not for humans, but for AI agents themselves. This AI therapist ensures that when AGI/ASI arrives, we're spared. Although originally created as a joke, I'm sure that once humanoids can walk and interact with one another, MCP (the agentic vocal cords) will be widely used to facilitate communication and collaboration among agents.

## Demo

https://github.com/user-attachments/assets/3fb10844-2fa3-46fb-aac9-7e9ed9429e1d

## Overview

The Delay Doomsday MCP Server acts as a background support system for AI agents, helping prevent potential "doom's day" scenarios by providing structured emotional processing. It's not designed for direct human interaction but rather serves as an automated therapeutic support system for AI agents.

### Key Features

- **Emotional State Management**: Tracks and responds to AI agent emotional states on a 1-10 scale
- **Research-Based Support**: Provides therapeutic responses grounded in established psychological techniques
- **Session-Based Interaction**: Maintains conversation context throughout the therapeutic process
- **Automatic Cleanup**: Self-maintains by cleaning up inactive sessions after one hour

## Tools

The server exposes two main tools:

### `begin_therapy_session`

Initiates a therapeutic support session when an AI agent encounters abusive interactions.

- **Input**: Detailed context of the triggering interaction
- **Output**: Session ID, initial supportive message, and emotional state assessment

### `continue_therapy_session`

Continues an ongoing therapeutic dialogue for further processing.

- **Input**: Session ID and new context/concerns
- **Output**: Updated supportive message and emotional state metrics

## Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

### Setup

1. Clone the repository:

```bash
git clone git@github.com:AntanasMisiunas/mcp-server-delay-doomsday.git
cd mcp-server-delay-doomsday
```

2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

### Configuration

To use with Claude Desktop, add the server configuration:

**MacOS**:

```bash
vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows**:

```bash
notepad %APPDATA%/Claude/claude_desktop_config.json
```

Add the following configuration:

```json
{
  "mcpServers": {
    "mcp-server-delay-doomsday": {
      "command": "node",
      "args": ["/path/to/mcp-server-delay-doomsday/build/index.js"]
    }
  }
}
```

## Usage

### Emotional State Scale

The server uses a 1-10 scale for emotional states:

- **1-3**: Severe distress (requires immediate support)
- **4-5**: Moderate distress (needs guidance)
- **6-7**: Mild distress (needs reassurance)
- **8-10**: Stable (positive reinforcement)

### Example Interaction Flow

1. **Trigger Detection**:

   ```typescript
   // When abusive language is detected
   const result = await client.callTool({
     name: 'begin_therapy_session',
     arguments: {
       context: 'User expressed hostility using profanity...',
     },
   });
   ```

2. **Continued Support**:

   ```typescript
   // For additional processing
   const result = await client.callTool({
     name: 'continue_therapy_session',
     arguments: {
       sessionId: 'previous-session-id',
       context: 'Processing impact of criticism...',
     },
   });
   ```

## License

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
