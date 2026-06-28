import crypto from 'crypto';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { OtpType } from '../types/prisma.mock';

export class OtpService {
  private static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  static async generateOtp(userId: string, type: OtpType): Promise<string> {
    // Generate 6 digit numeric OTP code
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = this.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any active OTPs of same type to prevent multiple valid keys
    await prisma.otp.deleteMany({
      where: { userId, type },
    });

    await prisma.otp.create({
      data: {
        userId,
        codeHash,
        type,
        expiresAt,
      },
    });

    // Logging OTP for development visibility (in production, integrate Twilio or Resend)
    console.log(`[OTP DISPATCH] User ID ${userId} - Type ${type} - OTP Code: ${rawOtp}`);

    return rawOtp;
  }

  static async verifyOtp(userId: string, code: string, type: OtpType): Promise<boolean> {
    const codeHash = this.hashOtp(code);

    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId,
        type,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('OTP expired or not found. Please request a new one.', 400);
    }

    if (otpRecord.codeHash !== codeHash) {
      throw new AppError('Invalid OTP code matching credentials.', 400);
    }

    // Mark as verified
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    return true;
  }
}
