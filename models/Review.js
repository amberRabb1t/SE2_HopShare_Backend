import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    ReviewID: { type: Number, index: true, unique: true },
    Rating: { type: Number, required: true },
    UserType: { type: Boolean, required: true }, // driver=true | passenger=false
    Description: { type: String },
    ReviewedUser: { type: Number, required: true },
    Timestamp: { type: Number },
    userID: { type: Number, required: true } // author
  },
  { timestamps: true, collection: 'reviews' }
);

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);