import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    MessageID: { type: Number, index: true, unique: true },
    MessageText: { type: String, required: true },
    Timestamp: { type: Number, required: true },
    userID: { type: Number, required: true },
    conversationID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'messages' }
);

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);