import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    ConversationID: { type: Number, index: true, unique: true, required: true },
    ConversationName: { type: String, required: true },
    Members: { type: [Number], default: [], required: true },
    Timestamp: { type: Number, required: true },
    UserID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'conversations' }
);

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

