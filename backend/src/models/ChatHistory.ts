import { Schema, model, Types } from 'mongoose';

export interface IChatHistory {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  message: string;
  isRead: boolean;
}

const chatHistorySchema = new Schema<IChatHistory>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender reference is required']
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver reference is required']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Index sender and receiver for fast retrieval of chat thread history
chatHistorySchema.index({ sender: 1, receiver: 1 });
chatHistorySchema.index({ receiver: 1, sender: 1 });

export const ChatHistory = model<IChatHistory>('ChatHistory', chatHistorySchema);
export default ChatHistory;
