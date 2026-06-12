import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Alert category is required'],
      enum: ['Energy', 'Water', 'Waste', 'Carbon'],
    },
    building: {
      type: String,
      required: [true, 'Building location is required'],
      trim: true,
    },
    severity: {
      type: String,
      required: [true, 'Severity level is required'],
      enum: ['Critical', 'Warning', 'Info'],
    },
    status: {
      type: String,
      enum: ['Open', 'Investigating', 'Resolved'],
      default: 'Open',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    impact: {
      type: String,
      default: '',
    },
    rootCause: {
      whatHappened: { type: String, default: '' },
      whyFlagged: { type: String, default: '' },
      potentialCause: { type: String, default: '' },
      estimatedImpact: { type: String, default: '' },
      recommendedAction: { type: String, default: '' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Alert = mongoose.model('Alert', alertSchema);
