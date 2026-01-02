import mongoose from 'mongoose';

/*
  Conversations are group-chat like structures that allow users to communicate.
  This schema contains all the necessary information to store a Conversation.
*/

const conversationSchema = new mongoose.Schema(
  {
    ConversationID: { type: Number, index: true, unique: true, required: true },  // Unique identifier for the conversation
    ConversationName: { type: String, required: true }, // Name of the conversation
    Members: { type: [Number], default: [], required: true }, // Array of UserIDs who are members of the conversation
    Timestamp: { type: Number, required: true }, // Unix timestamp of when the conversation was created
    UserID: { type: Number, required: true } // ID of the user who created the conversation
  },
  { timestamps: true, collection: 'conversations' }
);

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

