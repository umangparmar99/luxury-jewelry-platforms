import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { Role } from '../types/prisma.mock';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

export class AuthService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'jwt_access_secret';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret';

  static generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  static async signup(name: string, email: string, passwordHash: string, phone?: string) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existingUser) {
      throw new AppError('Email or phone number already registered.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordHash, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        phone,
        profile: {
          create: {}, // Initialize empty profile
        },
        cart: {
          create: {}, // Initialize empty cart
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(email: string, passwordHash: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);

    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async verifyEmail(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
      select: { id: true, email: true, isEmailVerified: true },
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch {
      throw new AppError('Authentication access token has expired or is invalid.', 401);
    }
  }

  static refreshSession(token: string) {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
      
      const tokens = this.generateTokens({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });

      return tokens;
    } catch {
      throw new AppError('Invalid refresh session credentials. Please login again.', 401);
    }
  }

  static async oauthLogin(name: string, email: string) {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Register new user (passwordHash is null for oauth users)
      user = await prisma.user.create({
        data: {
          name,
          email,
          isEmailVerified: true,
          profile: {
            create: {},
          },
          cart: {
            create: {},
          },
        },
      });
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }
}
