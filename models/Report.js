import mongoose from 'mongoose';

/*
  Reports are messages sent by users to the administration team to bring attention to other users' misconduct.
  This schema contains all the necessary information to store a Report.
*/

const reportSchema = new mongoose.Schema(
  {
    ReportID: { type: Number, index: true, unique: true, required: true },  // Unique identifier for the report
    Description: { type: String, required: true },  // Description of the reported wrongdoing
    ReportedUser: { type: Number, required: true }, // UserID of the user being reported
    State: { type: Boolean, default: false, required: true }, // pending=false, reviewed=true
    Timestamp: { type: Number, required: true }, // Report creation timestamp
    UserID: { type: Number, required: true } // UserID of the reporting user
  },
  { timestamps: true, collection: 'reports' }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

