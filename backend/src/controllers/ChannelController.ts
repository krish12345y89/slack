import { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import ChannelService from '../services/ChannelService';
import { AuthRequest } from '../middleware/AuthMiddleware';

class ChannelController {
  private channelService: ChannelService;

  constructor() {
    this.channelService = ChannelService.getInstance();
  }

  public validateCreate = [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Channel name must be 2-50 characters'),
    body('description')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Description must be max 200 characters'),
    body('isPrivate').optional().isBoolean(),
  ];

  public createChannel = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, description, isPrivate } = req.body;
      const channel = await this.channelService.createChannel(
        name,
        description || '',
        isPrivate || false,
        req.user!.userId
      );

      res.status(201).json({
        message: 'Channel created successfully',
        channel,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  public getChannels = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.channelService.getChannels(req.user!.userId, {
        page,
        limit,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getChannelById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const channel = await this.channelService.getChannelById(
        req.params.channelId
      );

      if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
      }

      res.json({ channel });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public joinChannel = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const channel = await this.channelService.joinChannel(
        req.params.channelId,
        req.user!.userId
      );

      if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
      }

      res.json({
        message: 'Joined channel successfully',
        channel,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public leaveChannel = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const channel = await this.channelService.leaveChannel(
        req.params.channelId,
        req.user!.userId
      );

      if (!channel) {
        res.status(404).json({ message: 'Channel not found' });
        return;
      }

      res.json({
        message: 'Left channel successfully',
        channel,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public deleteChannel = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const success = await this.channelService.deleteChannel(
        req.params.channelId,
        req.user!.userId
      );

      if (!success) {
        res.status(403).json({ message: 'Not authorized to delete channel' });
        return;
      }

      res.json({ message: 'Channel deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default new ChannelController();
