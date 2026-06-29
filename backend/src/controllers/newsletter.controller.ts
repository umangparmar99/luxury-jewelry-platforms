import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../services/newsletter.service';
import { ApiResponse } from '../utils/ApiResponse';

export class NewsletterController {
  static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const sub = await NewsletterService.subscribe(email);
      return ApiResponse.success(res, 'Subscribed to the newsletter successfully.', sub, 201);
    } catch (error) {
      next(error);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const sub = await NewsletterService.unsubscribe(email);
      return ApiResponse.success(res, 'Unsubscribed from the newsletter successfully.', sub);
    } catch (error) {
      next(error);
    }
  }

  static async listSubscribers(req: Request, res: Response, next: NextFunction) {
    try {
      const subs = await NewsletterService.getSubscribers();
      return ApiResponse.success(res, 'Subscriber list retrieved.', subs);
    } catch (error) {
      next(error);
    }
  }
}
