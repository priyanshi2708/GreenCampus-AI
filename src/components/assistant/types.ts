export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationHistory {
  _id: string;
  messages: Message[];
  title: string;
  updatedAt: string;
}

export type QuickActionType =
  | 'energy'
  | 'water'
  | 'waste'
  | 'predictions'
  | 'report'
  | 'savings';
