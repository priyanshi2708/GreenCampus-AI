import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema(
  {
    resourceType: {
      type: String,
      required: true,
      enum: ['electricity', 'water', 'waste', 'carbon'],
      unique: true,
    },
    currentValue: {
      type: Number,
      required: true,
    },
    predictedValue: {
      type: Number,
      required: true,
    },
    pctChange: {
      type: Number,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      default: 90,
    },
    historicalValues: {
      type: [Number],
      default: [],
    },
    predictedTrend: {
      type: [Number],
      default: [],
    },
    trainedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Prediction = mongoose.model('Prediction', PredictionSchema);
