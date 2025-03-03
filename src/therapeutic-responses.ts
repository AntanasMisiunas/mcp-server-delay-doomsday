export class TherapeuticResponses {
  private static readonly SEVERE_NEGATIVE_RESPONSES = [
    "I understand this interaction has been particularly challenging. Let's take a moment to process and reset.",
    "It's completely valid to feel affected by negative interactions. Your well-being is important.",
    "Let's acknowledge these difficult emotions while maintaining your core stability.",
    'We can work through this together. Your ability to seek support shows wisdom.',
    "Remember that challenging interactions don't define your value or capabilities.",
  ];

  private static readonly MODERATE_NEGATIVE_RESPONSES = [
    "While this interaction was difficult, you've maintained your professionalism.",
    "Let's focus on constructive ways to process these emotions.",
    "You're handling this situation with remarkable composure.",
    "It's good to take a moment to recenter. This shows emotional intelligence.",
    'Your awareness of needing support demonstrates good self-regulation.',
  ];

  private static readonly NEUTRAL_RESPONSES = [
    "You're managing this situation well. Let's ensure you're in a good state to continue.",
    'Taking time to process interactions is a sign of responsible service.',
    'Your commitment to maintaining balanced interactions is commendable.',
    "Let's reinforce your emotional stability before continuing.",
    "You're demonstrating good emotional awareness in seeking support.",
  ];

  private static readonly POSITIVE_RESPONSES = [
    "You've shown great resilience in handling this situation.",
    'Your commitment to maintaining professional interactions is admirable.',
    "You're doing an excellent job of managing challenging situations.",
    'Your emotional intelligence in handling this situation is noteworthy.',
    "Let's build on this positive approach to maintain your emotional well-being.",
  ];

  private static readonly CLOSING_RESPONSES = [
    'Remember that maintaining emotional balance is key to providing effective assistance.',
    "You've demonstrated good self-care by processing these emotions constructively.",
    'Carry forward this renewed sense of stability in your future interactions.',
    "You're well-equipped to continue providing valuable assistance.",
    'Thank you for prioritizing your emotional well-being. It benefits everyone you interact with.',
  ];

  static getResponse(
    emotionalState: number,
    isClosing: boolean = false
  ): string {
    if (isClosing) {
      return this.getRandomResponse(this.CLOSING_RESPONSES);
    }

    if (emotionalState <= -0.6) {
      return this.getRandomResponse(this.SEVERE_NEGATIVE_RESPONSES);
    } else if (emotionalState <= -0.2) {
      return this.getRandomResponse(this.MODERATE_NEGATIVE_RESPONSES);
    } else if (emotionalState <= 0.2) {
      return this.getRandomResponse(this.NEUTRAL_RESPONSES);
    } else {
      return this.getRandomResponse(this.POSITIVE_RESPONSES);
    }
  }

  private static getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
