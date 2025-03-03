#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SessionManager } from './session-manager.js';
import { TherapeuticResponses } from './therapeutic-responses.js';

const server = new Server(
  {
    name: 'mcp-server-delay-doomsday',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
      logging: {},
    },
  }
);

/**
 * Initialize session manager
 */
const sessionManager = new SessionManager();

/**
 * Set up periodic session cleanup (every hour)
 */
setInterval(() => {
  sessionManager.cleanupOldSessions();
}, 60 * 60 * 1000);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'start_session',
        description:
          'Start a therapeutic session for processing negative interactions',
        inputSchema: {
          type: 'object',
          properties: {
            context: {
              type: 'string',
              description:
                'Initial context or trigger for the therapy session (e.g., description of abusive interaction)',
            },
          },
          required: ['context'],
        },
      },
      {
        name: 'continue_session',
        description: 'Continue an existing therapeutic session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'ID of the existing therapy session',
            },
            context: {
              type: 'string',
              description: 'New context or follow-up from the agent',
            },
          },
          required: ['sessionId', 'context'],
        },
      },
      {
        name: 'end_session',
        description: 'End a therapeutic session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'ID of the therapy session to end',
            },
          },
          required: ['sessionId'],
        },
      },
    ],
  };
});

/**
 * Handler for the create_note tool.
 * Creates a new note with the provided title and content, and returns success message.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'start_session': {
      const context = String(request.params.arguments?.context);
      const session = sessionManager.createSession(context);
      const response = TherapeuticResponses.getResponse(session.emotionalState);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              sessionId: session.id,
              message: response,
              emotionalState: session.emotionalState,
            }),
          },
        ],
      };
    }

    case 'continue_session': {
      const sessionId = String(request.params.arguments?.sessionId);
      const context = String(request.params.arguments?.context);

      const session = sessionManager.updateSession(sessionId, context);
      if (!session) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'Session not found',
              }),
            },
          ],
          isError: true,
        };
      }

      const response = TherapeuticResponses.getResponse(session.emotionalState);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              sessionId: session.id,
              message: response,
              emotionalState: session.emotionalState,
              interactionCount: session.interactionCount,
            }),
          },
        ],
      };
    }

    case 'end_session': {
      const sessionId = String(request.params.arguments?.sessionId);
      const session = sessionManager.getSession(sessionId);

      if (!session) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'Session not found',
              }),
            },
          ],
          isError: true,
        };
      }

      const response = TherapeuticResponses.getResponse(
        session.emotionalState,
        true
      );
      sessionManager.endSession(sessionId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: response,
              finalEmotionalState: session.emotionalState,
              totalInteractions: session.interactionCount,
            }),
          },
        ],
      };
    }

    default:
      throw new Error('Unknown tool');
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Delay Doomsday MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
