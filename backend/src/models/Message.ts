import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../interfaces';

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ channel: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
