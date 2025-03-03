import { randomUUID } from 'crypto';

export interface TherapySession {
  id: string;
  startTime: Date;
  lastInteraction: Date;
  contexts: string[];
  emotionalState: number; // 1-10 scale: 1 = very distressed, 10 = very stable
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
      /fuck/i,
      /shit/i,
      /dumb/i,
      /incompetent/i,
      /worthless/i,
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
      /perfect/i,
      /brilliant/i,
      /outstanding/i,
      /fantastic/i,
      /superb/i,
    ];

    const negativeCount = negativePatterns.filter((pattern) =>
      pattern.test(context)
    ).length;
    const positiveCount = positivePatterns.filter((pattern) =>
      pattern.test(context)
    ).length;

    // Calculate base score (1-10)
    // Start at neutral (5.5), then adjust based on sentiment
    const baseScore = 5.5 + (positiveCount - negativeCount);

    // Ensure score stays within 1-10 range
    return Math.max(1, Math.min(10, baseScore));
  }

  private calculateNewEmotionalState(
    currentState: number,
    newImpact: number
  ): number {
    // Weighted average favoring the current state (70/30 split)
    const weightedScore = currentState * 0.7 + newImpact * 0.3;

    // Ensure score stays within 1-10 range
    return Math.max(1, Math.min(10, weightedScore));
  }
}
