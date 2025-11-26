import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    UserID: { type: Number, index: true, unique: true },
    Name: { type: String, required: true },
    PhoneNumber: { type: Number, required: true },
    PassengerRating: { type: Number, default: 0 },
    DriverRating: { type: Number, default: 0 },
    Banned: { type: Boolean, default: false },
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true }, // hashed or plain for mock
    IsAdmin: { type: Boolean, default: false },
    Timestamp: { type: Number }
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);