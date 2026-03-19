const mongoose = require('mongoose');

const eodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    projects:  { type: [String], default: [] },
    completed: { type: [String], default: [] },
    planned:   { type: [String], default: [] },
  },
  { timestamps: true }
);

// One EOD report per user per day
eodSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('EOD', eodSchema);
