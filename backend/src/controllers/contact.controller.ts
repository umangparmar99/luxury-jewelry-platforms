import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service';
import { ApiResponse } from '../utils/ApiResponse';

export class ContactController {
  static async submitMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const msg = await ContactService.submitMessage(req.body);
      return ApiResponse.success(res, 'Thank you for contacting our concierge. We will respond shortly.', msg, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await ContactService.getMessages();
      return ApiResponse.success(res, 'Concierge messages list retrieved.', messages);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const msg = await ContactService.markMessageAsRead(id);
      return ApiResponse.success(res, 'Concierge message marked as read.', msg);
    } catch (error) {
      next(error);
    }
  }
}
