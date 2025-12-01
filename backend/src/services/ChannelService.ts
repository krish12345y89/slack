import Channel from '../models/Channel';
import { IChannel, PaginatedResult, PaginationOptions } from '../interfaces';
import { Types } from 'mongoose';

class ChannelService {
  private static instance: ChannelService;

  private constructor() {}

  public static getInstance(): ChannelService {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService();
    }
    return ChannelService.instance;
  }

  public async createChannel(
    name: string,
    description: string,
    isPrivate: boolean,
    createdBy: string
  ): Promise<IChannel> {
    const channel = new Channel({
      name,
      description,
      isPrivate,
      createdBy: new Types.ObjectId(createdBy),
      members: [new Types.ObjectId(createdBy)],
    });

    await channel.save();
    return channel.populate('members', 'username email avatar isOnline');
  }

  public async getChannels(
    userId: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<IChannel>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { isPrivate: false },
        { members: new Types.ObjectId(userId) },
      ],
    };

    const [channels, totalItems] = await Promise.all([
      Channel.find(query)
        .populate('members', 'username email avatar isOnline')
        .populate('createdBy', 'username')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Channel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: channels,
      totalPages,
      currentPage: page,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  public async getChannelById(channelId: string): Promise<IChannel | null> {
    return Channel.findById(channelId)
      .populate('members', 'username email avatar isOnline')
      .populate('createdBy', 'username');
  }

  public async joinChannel(
    channelId: string,
    userId: string
  ): Promise<IChannel | null> {
    return Channel.findByIdAndUpdate(
      channelId,
      { $addToSet: { members: new Types.ObjectId(userId) } },
      { new: true }
    ).populate('members', 'username email avatar isOnline');
  }

  public async leaveChannel(
    channelId: string,
    userId: string
  ): Promise<IChannel | null> {
    return Channel.findByIdAndUpdate(
      channelId,
      { $pull: { members: new Types.ObjectId(userId) } },
      { new: true }
    ).populate('members', 'username email avatar isOnline');
  }

  public async deleteChannel(
    channelId: string,
    userId: string
  ): Promise<boolean> {
    const channel = await Channel.findById(channelId);
    
    if (!channel || channel.createdBy.toString() !== userId) {
      return false;
    }

    await Channel.findByIdAndDelete(channelId);
    return true;
  }

  public async getChannelMembers(channelId: string): Promise<string[]> {
    const channel = await Channel.findById(channelId);
    return channel?.members.map((m) => m.toString()) || [];
  }
}

export default ChannelService;
