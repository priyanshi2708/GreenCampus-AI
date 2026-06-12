import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Building name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Building code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    departments: {
      type: [String],
      default: [],
    },
    location: {
      latitude:  { type: Number },
      longitude: { type: Number },
    },
    yearBuilt: {
      type: Number,
    },
    floorArea: {
      type: Number, // square meters
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

buildingSchema.index({ name: 'text', code: 'text' });

export const Building = mongoose.model('Building', buildingSchema);
