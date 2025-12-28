import mongoose from 'mongoose';

/*
  Messages are individual text snippets sent by users within a Conversation.
  This schema contains all the necessary information to store a Message.
*/

const messageSchema = new mongoose.Schema(
  {
    MessageID: { type: Number, index: true, unique: true, required: true }, // Unique identifier for the message
    MessageText: { type: String, required: true },  // Message content
    Timestamp: { type: Number, required: true },  // Time the message was sent
    ConversationID: { type: Number, required: true }, // ID of the conversation this message belongs to
    UserID: { type: Number, required: true } // ID of the user who sent the message
  },
  { timestamps: true, collection: 'messages' }
);

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

