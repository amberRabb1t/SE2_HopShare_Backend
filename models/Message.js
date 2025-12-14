import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    MessageID: { type: Number, index: true, unique: true, required: true },
    MessageText: { type: String, required: true },
    Timestamp: { type: Number, required: true },
    ConversationID: { type: Number, required: true },
    UserID: { type: Number, required: true }
  },
  { timestamps: true, collection: 'messages' }
);

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

