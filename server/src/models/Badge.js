import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Badge title is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
    },
    icon: {
      type: String,
      required: [true, 'Badge icon is required'],
    },
    type: {
      type: String,
      required: [true, 'Badge type is required'],
      enum: ['Streak', 'Milestone', 'Special'],
    },
    requirement: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Badge = mongoose.model('Badge', badgeSchema);
