import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export interface AddressInput {
  name: string;
  type: 'SHIPPING' | 'BILLING';
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export class AddressService {
  static async getAddresses(userId: string) {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createAddress(userId: string, data: AddressInput) {
    return await prisma.$transaction(async (tx) => {
      // If setting this address as default, unset any previous defaults for the user
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Check if this is the first address, if so default it
      const count = await tx.address.count({ where: { userId } });
      const shouldBeDefault = count === 0 ? true : !!data.isDefault;

      return tx.address.create({
        data: {
          userId,
          name: data.name,
          type: data.type,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: shouldBeDefault,
        },
      });
    });
  }

  static async updateAddress(userId: string, addressId: string, data: Partial<AddressInput>) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new AppError('Address record not found.', 404);
    }

    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          name: data.name,
          type: data.type,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: data.isDefault,
        },
      });
    });
  }

  static async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new AppError('Address record not found.', 404);
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If we deleted the default address, set another default address if any exists
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { id: addressId };
  }
}
