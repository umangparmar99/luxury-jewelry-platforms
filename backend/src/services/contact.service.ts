import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class ContactService {
  static async submitMessage(data: { name: string; email: string; subject?: string | null; message: string }) {
    return await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        subject: data.subject,
        message: data.message,
      },
    });
  }

  static async getMessages() {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async markMessageAsRead(id: string) {
    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) {
      throw new AppError('Concierge message details not found.', 404);
    }

    return await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
