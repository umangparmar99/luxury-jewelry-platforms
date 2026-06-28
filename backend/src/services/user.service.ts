import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { KycStatus } from '../types/prisma.mock';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        phone: true,
        isPhoneVerified: true,
        profile: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User profile details not found.', 404);
    }

    return user;
  }

  static async updateProfile(userId: string, data: { name?: string; avatarUrl?: string | null; phone?: string | null }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;

    // Update root User and linked Profile in a transaction
    return await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      if (data.avatarUrl !== undefined) {
        await tx.profile.update({
          where: { userId },
          data: { avatarUrl: data.avatarUrl },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          profile: true,
        },
      });
    });
  }

  static async submitKyc(userId: string, documentUrl: string) {
    return await prisma.profile.update({
      where: { userId },
      data: {
        kycDocumentUrl: documentUrl,
        kycStatus: KycStatus.PENDING,
      },
    });
  }

  static async verifyKyc(userId: string, status: KycStatus) {
    if (status === KycStatus.NONE) {
      throw new AppError('Invalid KYC status target configuration.', 400);
    }

    return await prisma.profile.update({
      where: { userId },
      data: { kycStatus: status },
    });
  }
}
