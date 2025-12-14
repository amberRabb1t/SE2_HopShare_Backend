import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    RouteID: { type: Number, index: true, unique: true, required: true },
    Start: { type: String, required: true },
    End: { type: String, required: true },
    Stops: { type: String, required: true },
    Comment: { type: String },
    DateAndTime: { type: Number, required: true },
    OccupiedSeats: { type: Number, required: true },
    Rules: [{ type: Boolean }],
    Timestamp: { type: Number, required: true },
    UserID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'routes' }
);

export const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

