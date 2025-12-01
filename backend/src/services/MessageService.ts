import Message from '../models/Message';
import { IMessage, PaginatedResult, PaginationOptions } from '../interfaces';
import { Types } from 'mongoose';

class MessageService {
  private static instance: MessageService;

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async createMessage(
    content: string,
    senderId: string,
    channelId: string,
    type: 'text' | 'image' | 'file' = 'text'
  ): Promise<IMessage> {
    const message = new Message({
      content,
      sender: new Types.ObjectId(senderId),
      channel: new Types.ObjectId(channelId),
      type,
    });

    await message.save();
    return message.populate('sender', 'username email avatar');
  }

  public async getMessages(
    channelId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<IMessage>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const query = {
      channel: new Types.ObjectId(channelId),
      isDeleted: false,
    };

    const [messages, totalItems] = await Promise.all([
      Message.find(query)
        .populate('sender', 'username email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: messages.reverse(),
      totalPages,
      currentPage: page,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  public async updateMessage(
    messageId: string,
    userId: string,
    content: string
  ): Promise<IMessage | null> {
    const message = await Message.findById(messageId);

    if (!message || message.sender.toString() !== userId) {
      return null;
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    return message.populate('sender', 'username email avatar');
  }

  public async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    const message = await Message.findById(messageId);

    if (!message || message.sender.toString() !== userId) {
      return false;
    }

    message.isDeleted = true;
    message.content = 'This message has been deleted';
    await message.save();

    return true;
  }

  public async getMessageById(messageId: string): Promise<IMessage | null> {
    return Message.findById(messageId).populate(
      'sender',
      'username email avatar'
    );
  }
}

export default MessageService;
