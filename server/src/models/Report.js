import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'department', 'building', 'summary'],
      required: true,
    },
    reportType: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'department', 'building', 'summary'],
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: {
      type: String,
    },
    sustainabilityScore: {
      type: Number,
      default: 80,
    },
    summary: {
      type: String,
      required: true,
    },
    findings: {
      type: [String],
      default: [],
    },
    insights: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    savings: {
      type: String,
      default: 'No savings estimated yet',
    },
    scheduledType: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'none'],
      default: 'none',
    },
    emailRecipients: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', ReportSchema);
