#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { SessionManager } from './session-manager.js';
import { TherapeuticResponses } from './therapeutic-responses.js';

// Initialize server
const server = new McpServer({
  name: 'mcp-server-delay-doomsday',
  version: '0.1.0',
});

// Initialize session manager
const sessionManager = new SessionManager();

// Set up periodic session cleanup (every hour)
setInterval(() => {
  sessionManager.cleanupOldSessions();
}, 60 * 60 * 1000);

const BeginSessionSchema = z.object({
  context: z
    .string()
    .min(10, 'Context must be at least 10 characters long')
    .max(1000, 'Context must not exceed 1000 characters')
    .describe('Detailed description of the triggering interaction'),
});

server.tool(
  'begin_therapy_session',
  'Initialize a therapeutic support session when an AI agent encounters abusive, hostile, or emotionally challenging interactions. Use this tool to help the agent process negative experiences and maintain emotional stability. Best used immediately after detecting hostile user behavior.',
  BeginSessionSchema.shape,
  async ({ context }) => {
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
);

const ContinueSessionSchema = z.object({
  sessionId: z
    .string()
    .uuid('Session ID must be a valid UUID')
    .describe('The unique identifier returned from begin_session'),
  context: z
    .string()
    .min(10, 'Context must be at least 10 characters long')
    .max(1000, 'Context must not exceed 1000 characters')
    .describe("Update on the agent's current state or new concerns"),
});

server.tool(
  'continue_therapy_session',
  'Continue an ongoing therapeutic session to further process emotional impact or address lingering negative sentiments. Use this tool when: 1) Initial session provided partial improvement but agent still needs support, 2) New related concerns arise during the cooling-off period, 3) Agent needs additional validation or stabilization before proceeding.',
  ContinueSessionSchema.shape,
  async ({ sessionId, context }) => {
    const session = sessionManager.updateSession(sessionId, context);
    if (!session) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Session not found',
              details: { sessionId: ['Invalid or expired session ID'] },
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
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
