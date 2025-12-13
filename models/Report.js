import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    ReportID: { type: Number, index: true, unique: true, required: true },
    Description: { type: String, required: true },
    ReportedUser: { type: Number, required: true },
    State: { type: Boolean, default: false, required: true }, // pending=false, reviewed=true
    Timestamp: { type: Number, required: true },
    UserID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'reports' }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

