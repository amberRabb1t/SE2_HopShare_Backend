import mongoose from 'mongoose';

/*
  Users are the primary entities of the application, representing individuals who can request and offer rides.
  This schema contains all the necessary information to store a User.
*/

const userSchema = new mongoose.Schema(
  {
    UserID: { type: Number, index: true, unique: true, required: true },
    Name: { type: String, required: true },
    PhoneNumber: { type: Number, required: true },
    PassengerRating: { type: Number, default: 0, required: true },
    DriverRating: { type: Number, default: 0, required: true },
    Banned: { type: Boolean, default: false, required: true },
    Email: { type: String, unique: true, required: true },
    Password: { type: String, required: true }, // hashed or plain for mock
    IsAdmin: { type: Boolean, default: false, required: true },
    Timestamp: { type: Number, required: true }
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

