import mongoose, { Schema } from 'mongoose';
import { IChannel } from '../interfaces';

const ChannelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 200,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ChannelSchema.index({ name: 1 });
ChannelSchema.index({ members: 1 });

export default mongoose.model<IChannel>('Channel', ChannelSchema);
