import mongoose from 'mongoose';

/*
  Routes are public, user-generated posts indicating an available ride from a start location to an end location.
  This schema contains all the necessary information to store a Route.
*/

const routeSchema = new mongoose.Schema(
  {
    RouteID: { type: Number, index: true, unique: true, required: true }, // Unique identifier for the Route
    Start: { type: String, required: true }, // Starting location of the Route
    End: { type: String, required: true }, // Ending location of the Route
    Stops: { type: String, required: true }, // Intermediate stops along the Route
    Comment: { type: String }, // Additional comments or notes about the Route added by its creator
    DateAndTime: { type: Number, required: true }, // Date and time of when the Route should be driven
    OccupiedSeats: { type: Number, required: true }, // Number of seats already occupied on the Route (if it equals the used Car's total seats, the Route is full)
    Rules: [{ type: Boolean }], // Rules list that has to be obeyed by passengers and the driver of the Route
    Timestamp: { type: Number, required: true }, // Route creation timestamp
    UserID: { type: Number, required: true }  // Identifier of the user who created the Route
  },
  { timestamps: true, collection: 'routes' }
);

export const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

