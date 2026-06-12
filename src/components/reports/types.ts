export interface ReportData {
  _id: string;
  title: string;
  type: string;
  period: string;
  sustainabilityScore: number;
  summary: string;
  findings: string[];
  recommendations: string[];
  savings: string;
  scheduledType?: string;
  emailRecipients?: string[];
  createdAt: string;
  reportType?: string;
  generatedDate?: string;
  pdfUrl?: string;
  insights?: string[];
}

export interface ReportChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
