import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    ReportID: { type: Number, index: true, unique: true },
    Description: { type: String, required: true },
    ReportedUser: { type: Number, required: true },
    State: { type: Boolean, default: false }, // pending=false, reviewed=true
    Timestamp: { type: Number }
  },
  { timestamps: true, collection: 'reports' }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);