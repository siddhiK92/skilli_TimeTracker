const mongoose = require('mongoose');

const attendanceLogSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:       { type: String, required: true },
    loginTime:  { type: Date, default: null },
    logoutTime: { type: Date, default: null },
    status:     { type: String, enum: ['present', 'absent', 'leave', 'half-day'], default: 'present' },
    workingMs:  { type: Number, default: 0 },
    note:       { type: String, default: '' },
  },
  { timestamps: true }
);

attendanceLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
