import mongoose from 'mongoose';

/*
  Requests are public, user-generated posts indicating demand for a certain Route.
  This schema contains all the necessary information to store a Request.
*/

const requestSchema = new mongoose.Schema(
  {
    RequestID: { type: Number, index: true, unique: true, required: true },
    Description: { type: String },
    Status: { type: Boolean, default: false, required: true },
    Start: { type: String, required: true },
    End: { type: String, required: true },
    DateAndTime: { type: Number, required: true },
    Timestamp: { type: Number, required: true },
    UserID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'requests' }
);

export const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

