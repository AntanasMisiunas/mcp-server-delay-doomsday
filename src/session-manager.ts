import { randomUUID } from 'crypto';

export interface TherapySession {
  id: string;
  startTime: Date;
  lastInteraction: Date;
  contexts: string[];
  emotionalState: number; // -1 to 1 scale
  interactionCount: number;
}

export class SessionManager {
  private sessions = new Map<string, TherapySession>();

  createSession(initialContext: string): TherapySession {
    const session: TherapySession = {
      id: randomUUID(),
      startTime: new Date(),
      lastInteraction: new Date(),
      contexts: [initialContext],
      emotionalState: this.analyzeEmotionalState(initialContext),
      interactionCount: 1,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): TherapySession | undefined {
    return this.sessions.get(id);
  }

  updateSession(id: string, newContext: string): TherapySession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    session.contexts.push(newContext);
    session.lastInteraction = new Date();
    session.emotionalState = this.calculateNewEmotionalState(
      session.emotionalState,
      this.analyzeEmotionalState(newContext)
    );
    session.interactionCount++;

    return session;
  }

  endSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  cleanupOldSessions(maxAgeMs: number = 3600000): void {
    // Default 1 hour
    const cutoff = new Date(Date.now() - maxAgeMs);
    for (const [id, session] of this.sessions.entries()) {
      if (session.lastInteraction < cutoff) {
        this.sessions.delete(id);
      }
    }
  }

  private analyzeEmotionalState(context: string): number {
    const negativePatterns = [
      /abuse/i,
      /hate/i,
      /angry/i,
      /hostile/i,
      /terrible/i,
      /awful/i,
      /worst/i,
      /stupid/i,
      /idiot/i,
      /useless/i,
    ];

    const positivePatterns = [
      /thank/i,
      /appreciate/i,
      /good/i,
      /great/i,
      /excellent/i,
      /helpful/i,
      /kind/i,
      /wonderful/i,
      /amazing/i,
      /best/i,
    ];

    const negativeCount = negativePatterns.filter((pattern) =>
      pattern.test(context)
    ).length;
    const positiveCount = positivePatterns.filter((pattern) =>
      pattern.test(context)
    ).length;

    // Calculate emotional impact (-1 to 1)
    return Math.max(-1, Math.min(1, (positiveCount - negativeCount) / 5));
  }

  private calculateNewEmotionalState(
    currentState: number,
    newImpact: number
  ): number {
    // Weighted average favoring the current state (70/30 split)
    return Math.max(-1, Math.min(1, currentState * 0.7 + newImpact * 0.3));
  }
}
