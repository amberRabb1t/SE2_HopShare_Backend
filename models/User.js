import mongoose from 'mongoose';

/*
  Users are the primary entities of the application, representing individuals who can request and offer rides,
  join conversations and send messages, as well as review and report other users.
  This schema contains all the necessary information to store a User.
*/

const userSchema = new mongoose.Schema(
  {
    UserID: { type: Number, index: true, unique: true, required: true }, // Unique identifier for the user
    Name: { type: String, required: true }, // Name of the user; not necessarily unique
    PhoneNumber: { type: Number, unique: true, required: true }, // User's phone number; has to be unique
    PassengerRating: { type: Number, default: 0, required: true }, // Average rating as a passenger
    DriverRating: { type: Number, default: 0, required: true }, // Average rating as a driver
    Banned: { type: Boolean, default: false, required: true }, // Indicates if the user is banned from the platform
    Email: { type: String, unique: true, required: true }, // Email address of the user; needs to be unique
    Password: { type: String, required: true }, // hashed or plain for mock
    IsAdmin: { type: Boolean, default: false, required: true }, // Indicates if the user has administrator privileges
    Timestamp: { type: Number, required: true } // Account creation timestamp
  },
  { timestamps: true, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

