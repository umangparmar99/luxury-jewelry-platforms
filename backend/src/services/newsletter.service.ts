import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class NewsletterService {
  static async subscribe(email: string) {
    const trimmedEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletter.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        throw new AppError('This email address is already subscribed.', 400);
      } else {
        // Resubscribe
        return await prisma.newsletter.update({
          where: { email: trimmedEmail },
          data: { isActive: true },
        });
      }
    }

    return await prisma.newsletter.create({
      data: {
        email: trimmedEmail,
        isActive: true,
      },
    });
  }

  static async unsubscribe(email: string) {
    const trimmedEmail = email.toLowerCase().trim();
    const existing = await prisma.newsletter.findUnique({
      where: { email: trimmedEmail },
    });

    if (!existing) {
      throw new AppError('Subscription details not found.', 404);
    }

    return await prisma.newsletter.update({
      where: { email: trimmedEmail },
      data: { isActive: false },
    });
  }

  static async getSubscribers() {
    return await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
