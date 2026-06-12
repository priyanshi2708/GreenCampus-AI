import mongoose from 'mongoose';

// Carbon emission factors (kg CO2e per unit)
const ELECTRICITY_FACTOR = 0.233; // per kWh
const WASTE_FACTOR       = 0.054; // per kg

const resourceSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    electricity: {
      type: Number,
      required: [true, 'Electricity usage (kWh) is required'],
      min: [0, 'Electricity cannot be negative'],
    },
    water: {
      type: Number,
      required: [true, 'Water usage (Liters) is required'],
      min: [0, 'Water cannot be negative'],
    },
    waste: {
      type: Number,
      required: [true, 'Waste (kg) is required'],
      min: [0, 'Waste cannot be negative'],
    },
    carbon: {
      type: Number,
      // Auto-calculated; not required from client
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

// Auto-calculate carbon before every save
resourceSchema.pre('save', function (next) {
  this.carbon = parseFloat(
    (this.electricity * ELECTRICITY_FACTOR + this.waste * WASTE_FACTOR).toFixed(4),
  );
  next();
});

// Also auto-calculate on findOneAndUpdate / updateOne
resourceSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.electricity !== undefined || update.waste !== undefined) {
    const elec  = update.electricity  ?? 0;
    const waste = update.waste        ?? 0;
    update.carbon = parseFloat((elec * ELECTRICITY_FACTOR + waste * WASTE_FACTOR).toFixed(4));
  }
  next();
});

// Compound indexes for fast filtering
resourceSchema.index({ building: 1, date: -1 });
resourceSchema.index({ department: 1, date: -1 });
resourceSchema.index({ date: -1 });

export const Resource = mongoose.model('Resource', resourceSchema);
