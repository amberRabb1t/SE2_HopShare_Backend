import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    ConversationID: { type: Number, index: true, unique: true },
    ConversationName: { type: String, required: true },
    Timestamp: { type: Number },
    userID: { type: Number, required: true } // owner (as per path /users/{userID}/conversations)
  },
  { timestamps: true, collection: 'conversations' }
);

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);