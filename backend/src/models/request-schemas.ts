import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});

export const otpSendSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    type: z.enum(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'MFA']),
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'OTP must be exactly 6 digits'),
    type: z.enum(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'MFA']),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    phone: z.string().optional().nullable(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Address label is required (e.g. Home, Work)'),
    type: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
    phone: z.string().min(5, 'Phone number is required'),
    addressLine1: z.string().min(1, 'Address Line 1 is required'),
    addressLine2: z.string().optional().nullable(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    isDefault: z.boolean().default(false),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
  }),
});

export const collectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Collection name is required'),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
  }),
});

export const metalConfigSchema = z.object({
  metalType: z.enum(['YELLOW_GOLD_18K', 'WHITE_GOLD_18K', 'ROSE_GOLD_18K', 'PLATINUM']),
  priceAdjustment: z.number().nonnegative(),
});

export const variantSchema = z.object({
  sku: z.string().min(1),
  metalType: z.enum(['YELLOW_GOLD_18K', 'WHITE_GOLD_18K', 'ROSE_GOLD_18K', 'PLATINUM']),
  ringSize: z.number().nullable().optional(),
  price: z.number().positive(),
  stock: z.number().nonnegative(),
  imageUrls: z.array(z.string().url()),
});

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    sku: z.string().min(1, 'Baseline SKU is required'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    basePrice: z.number().positive('Base price must be positive'),
    isCustomizable: z.boolean().default(false),
    categoryId: z.string().uuid('Invalid Category ID'),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
    metalConfigs: z.array(metalConfigSchema).optional(),
    variants: z.array(variantSchema).optional(),
    collectionIds: z.array(z.string().uuid()).optional(),
  }),
});

export const cartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    quantity: z.number().positive('Quantity must be greater than 0').default(1),
    selectedMetal: z.enum(['YELLOW_GOLD_18K', 'WHITE_GOLD_18K', 'ROSE_GOLD_18K', 'PLATINUM']).optional().nullable(),
    selectedSize: z.number().optional().nullable(),
    customEngraving: z.string().max(100).optional().nullable(),
    selectedGemstoneId: z.string().uuid().optional().nullable(),
  }),
});

export const wishlistSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid Product ID'),
    selectedMetal: z.enum(['YELLOW_GOLD_18K', 'WHITE_GOLD_18K', 'ROSE_GOLD_18K', 'PLATINUM']).optional().nullable(),
    selectedSize: z.number().optional().nullable(),
    selectedGemstoneId: z.string().uuid().optional().nullable(),
  }),
});

export const couponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(20),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().nonnegative().optional().nullable(),
    maxDiscountAmount: z.number().nonnegative().optional().nullable(),
    expiresAt: z.string().transform((val) => new Date(val)),
    isActive: z.boolean().default(true),
    usageLimit: z.number().positive().optional().nullable(),
  }),
});

export const orderCreateSchema = z.object({
  body: z.object({
    shippingAddressId: z.string().uuid('Invalid shipping address ID'),
    billingAddressId: z.string().uuid('Invalid billing address ID'),
    paymentGateway: z.enum(['STRIPE', 'RAZORPAY', 'BANK_TRANSFER']),
    couponCode: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
  }),
});

export const reviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional().nullable(),
  }),
});
