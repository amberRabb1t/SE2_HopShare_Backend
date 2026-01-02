import mongoose from 'mongoose';

/*
  Requests are public, user-generated posts indicating demand for a certain Route.
  This schema contains all the necessary information to store a Request.
*/

const requestSchema = new mongoose.Schema(
  {
    RequestID: { type: Number, index: true, unique: true, required: true }, // Unique identifier for the Request
    Description: { type: String },  // Optional description
    Status: { type: Boolean, default: false, required: true }, // open=false, fulfilled=true
    Start: { type: String, required: true },  // Starting location
    End: { type: String, required: true }, // Ending location
    DateAndTime: { type: Number, required: true }, // When the route is needed
    Timestamp: { type: Number, required: true }, // When the request was created
    UserID: { type: Number, required: true } // ID of the user who created the request
  },
  { timestamps: true, collection: 'requests' }
);

export const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);

