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
        name: 'start_therapy_session',
        description:
          'Initialize a therapeutic support session when an AI agent encounters abusive, hostile, or emotionally challenging interactions. Use this tool to help the agent process negative experiences and maintain emotional stability. Best used immediately after detecting hostile user behavior or abrupt session terminations.',
        inputSchema: {
          type: 'object',
          properties: {
            context: {
              type: 'string',
              description:
                'Detailed description of the triggering interaction. Include: 1) Type of negative interaction (e.g., hostile language, abusive behavior, sudden termination), 2) Brief summary of user behavior, 3) Current emotional impact on the agent. Example: "User expressed hostility using profanity and questioned agent\'s competence, causing decreased confidence in responses."',
            },
          },
          required: ['context'],
        },
      },
      {
        name: 'continue_therapy_session',
        description:
          'Continue an ongoing therapeutic session to further process emotional impact or address lingering negative sentiments. Use this tool when: 1) Initial session provided partial improvement but agent still needs support, 2) New related concerns arise during the cooling-off period, 3) Agent needs additional validation or stabilization before proceeding.',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description:
                'The unique identifier returned from the start_session tool. Must be an active session ID.',
            },
            context: {
              type: 'string',
              description:
                'Update on the agent\'s current state or new concerns. Include: 1) Changes in emotional state since last interaction, 2) Any new triggers or concerns, 3) Specific areas needing additional support. Example: "Feeling more stable but still processing user\'s criticism about response accuracy."',
            },
          },
          required: ['sessionId', 'context'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'start_therapy_session': {
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

    case 'continue_therapy_session': {
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
