import mongoose from 'mongoose';

/*
  Each Route corresponds to a Car that will be used to fulfill it.
  This schema contains all the necessary information to store a user's Car.
*/

const carSchema = new mongoose.Schema(
  {
    CarID: { type: Number, index: true, unique: true, required: true }, // Unique identifier for the Car
    Seats: { type: Number, required: true },  // Number of seats the Car has
    ServiceDate: { type: Number, required: true }, // Most recent date the Car was serviced
    MakeModel: { type: String, required: true }, // Make and model of the Car
    LicensePlate: { type: String, required: true }, // License plate number of the Car
    Timestamp: { type: Number, required: true }, // Timestamp when the Car record was created
    UserID: { type: Number, required: true } // ID of the user who owns the Car
  },
  { timestamps: true, collection: 'cars' }
);

export const Car = mongoose.models.Car || mongoose.model('Car', carSchema);

