import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    CarID: { type: Number, index: true, unique: true },
    Seats: { type: Number, required: true },
    ServiceDate: { type: Number, required: true },
    MakeModel: { type: String, required: true },
    LicensePlate: { type: String, required: true },
    Timestamp: { type: Number },
    userID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'cars' }
);

export const Car = mongoose.models.Car || mongoose.model('Car', carSchema);