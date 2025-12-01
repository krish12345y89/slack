import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import MessageService from '../services/MessageService';
import { AuthRequest } from '../middleware/AuthMiddleware';

class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = MessageService.getInstance();
  }

  public validateCreate = [
    body('content')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be 1-2000 characters'),
    body('type')
      .optional()
      .isIn(['text', 'image', 'file'])
      .withMessage('Invalid message type'),
  ];

  public getMessages = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { channelId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.messageService.getMessages(channelId, {
        page,
        limit,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public createMessage = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { channelId } = req.params;
      const { content, type } = req.body;

      const message = await this.messageService.createMessage(
        content,
        req.user!.userId,
        channelId,
        type
      );

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  public updateMessage = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await this.messageService.updateMessage(
        messageId,
        req.user!.userId,
        content
      );

      if (!message) {
        res.status(403).json({ message: 'Not authorized to edit message' });
        return;
      }

      res.json({
        message: 'Message updated successfully',
        data: message,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public deleteMessage = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { messageId } = req.params;

      const success = await this.messageService.deleteMessage(
        messageId,
        req.user!.userId
      );

      if (!success) {
        res.status(403).json({ message: 'Not authorized to delete message' });
        return;
      }

      res.json({ message: 'Message deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default new MessageController();
