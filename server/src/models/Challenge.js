import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
    },
    category: {
      type: String,
      required: [true, 'Challenge category is required'],
      enum: ['Energy', 'Water', 'Waste', 'Carbon'],
    },
    type: {
      type: String,
      required: [true, 'Challenge duration type is required'],
      enum: ['Weekly', 'Monthly', 'Campus'],
    },
    pointsReward: {
      type: Number,
      required: [true, 'Points reward is required'],
      min: [0, 'Reward points cannot be negative'],
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Challenge = mongoose.model('Challenge', challengeSchema);
