import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding database elements (SQLite mode)...');

  // Clear existing database entries to prevent duplicate constraint issues
  await prisma.appointment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productMetalConfig.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.gemstone.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.coupon.deleteMany({});

  // 1. Create Default Administrative Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@Luxury123', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@luxurybrand.com' },
    update: {},
    create: {
      email: 'admin@luxurybrand.com',
      name: 'Luxury Admin Team',
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      profile: {
        create: {
          avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v12345/avatar_admin.png',
          kycStatus: 'APPROVED',
        },
      },
      cart: {
        create: {},
      },
    },
  });
  console.log(`[Seed] Admin User provisioned: ${adminUser.email}`);

  // 2. Create Categories Tree Hierarchy
  const ringsCat = await prisma.category.upsert({
    where: { slug: 'rings' },
    update: {},
    create: {
      name: 'Rings',
      slug: 'rings',
      description: 'Exquisite diamond, gold and platinum rings crafted for all occasions.',
    },
  });

  const engagementRings = await prisma.category.upsert({
    where: { slug: 'engagement-rings' },
    update: {},
    create: {
      name: 'Engagement Rings',
      slug: 'engagement-rings',
      description: 'Elegant custom designer solitaire and halo engagement rings.',
      parentId: ringsCat.id,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'necklaces' },
    update: {},
    create: {
      name: 'Necklaces & Pendants',
      slug: 'necklaces',
      description: 'Chains, classic lockets, and bespoke diamond encrusted pendants.',
    },
  });
  console.log('[Seed] Categories hierarchy seeded.');

  // 3. Create Product Collections
  const bridalCollection = await prisma.collection.upsert({
    where: { slug: 'bridal-collection' },
    update: {},
    create: {
      name: 'Bridal Collection',
      slug: 'bridal-collection',
      description: 'Handcrafted engagement settings and wedding bands to mark forever.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v12345/bridal_banner.jpg',
    },
  });
  console.log('[Seed] Collections seeded.');

  // 4. Create Baseline Customizable Product Settings
  const settingsData = [
    {
      name: 'Classic Solitaire Setting',
      slug: 'classic-solitaire-setting',
      sku: 'SET-SOL-001',
      description: 'A timeless four-prong setting matching standard round and oval cut center stone shapes.',
      basePrice: 950.00,
      metalConfigs: [
        { metalType: 'YELLOW_GOLD_18K', priceAdjustment: 0.00 },
        { metalType: 'WHITE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'ROSE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'PLATINUM', priceAdjustment: 350.00 },
      ],
      variants: [
        { sku: 'SET-SOL-001-YG6', metalType: 'YELLOW_GOLD_18K', ringSize: 6.00, price: 950.00, stock: 10, imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop']) },
        { sku: 'SET-SOL-001-PT6', metalType: 'PLATINUM', ringSize: 6.00, price: 1300.00, stock: 5, imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop']) },
      ]
    },
    {
      name: 'The Sapphire Halo Ring',
      slug: 'the-sapphire-halo-ring',
      sku: 'SET-SAP-002',
      description: 'Bespoke setting with a halo of Ceylon sapphire pavé stones surrounding the main certified diamond.',
      basePrice: 3200.00,
      metalConfigs: [
        { metalType: 'YELLOW_GOLD_18K', priceAdjustment: 0.00 },
        { metalType: 'WHITE_GOLD_18K', priceAdjustment: 100.00 },
        { metalType: 'ROSE_GOLD_18K', priceAdjustment: 100.00 },
        { metalType: 'PLATINUM', priceAdjustment: 400.00 },
      ],
      variants: [
        { sku: 'SET-SAP-002-YG6', metalType: 'YELLOW_GOLD_18K', ringSize: 6.00, price: 3200.00, stock: 4, imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop']) },
      ]
    },
    {
      name: 'Classic Pavé Diamond Band',
      slug: 'classic-pave-diamond-band',
      sku: 'SET-PAV-003',
      description: 'Hand-set micro-pavé diamonds along the shoulders of the band, highlighting the center stone sparkle.',
      basePrice: 1850.00,
      metalConfigs: [
        { metalType: 'YELLOW_GOLD_18K', priceAdjustment: 0.00 },
        { metalType: 'WHITE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'ROSE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'PLATINUM', priceAdjustment: 350.00 },
      ],
      variants: [
        { sku: 'SET-PAV-003-PT6', metalType: 'PLATINUM', ringSize: 6.00, price: 2200.00, stock: 7, imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=600&auto=format&fit=crop']) },
      ]
    },
    {
      name: 'Emerald Cut Marquise Setting',
      slug: 'emerald-cut-marquise-setting',
      sku: 'SET-EMR-004',
      description: 'A modern sleek design custom-tailored for rectangular emerald cuts and elongated marquise shapes.',
      basePrice: 1450.00,
      metalConfigs: [
        { metalType: 'YELLOW_GOLD_18K', priceAdjustment: 0.00 },
        { metalType: 'WHITE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'ROSE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'PLATINUM', priceAdjustment: 300.00 },
      ],
      variants: [
        { sku: 'SET-EMR-004-YG6', metalType: 'YELLOW_GOLD_18K', ringSize: 6.00, price: 1450.00, stock: 8, imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop']) },
      ]
    },
    {
      name: 'Eternal Gold Band',
      slug: 'eternal-gold-band',
      sku: 'SET-GLD-005',
      description: 'Elegantly minimal band configurations for men and women, featuring clean lines and comfort-fit inside profile.',
      basePrice: 750.00,
      metalConfigs: [
        { metalType: 'YELLOW_GOLD_18K', priceAdjustment: 0.00 },
        { metalType: 'WHITE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'ROSE_GOLD_18K', priceAdjustment: 50.00 },
        { metalType: 'PLATINUM', priceAdjustment: 250.00 },
      ],
      variants: [
        { sku: 'SET-GLD-005-YG6', metalType: 'YELLOW_GOLD_18K', ringSize: 6.00, price: 750.00, stock: 15, imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=600&auto=format&fit=crop']) },
      ]
    }
  ];

  for (const s of settingsData) {
    await prisma.product.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name,
        slug: s.slug,
        sku: s.sku,
        description: s.description,
        basePrice: s.basePrice,
        isCustomizable: true,
        categoryId: engagementRings.id,
        status: 'ACTIVE',
        collections: {
          connect: { id: bridalCollection.id },
        },
        metalConfigs: {
          create: s.metalConfigs
        },
        variants: {
          create: s.variants
        }
      }
    });
    console.log(`[Seed] Customizable Setting provisioned: ${s.name}`);
  }

  // 5. Create Certified Loose Gemstones Vault
  const gemstonesData = [
    { certificateNumber: 'GIA-123456789', shape: 'ROUND', carat: 1.25, color: 'D', clarity: 'VVS1', cut: 'EXCELLENT', price: 8500.00 },
    { certificateNumber: 'GIA-987654321', shape: 'ROUND', carat: 1.80, color: 'E', clarity: 'IF', cut: 'EXCELLENT', price: 14500.00 },
    { certificateNumber: 'GIA-246813579', shape: 'OVAL', carat: 2.10, color: 'F', clarity: 'VS1', cut: 'EXCELLENT', price: 16200.00 },
    { certificateNumber: 'GIA-135792468', shape: 'EMERALD', carat: 0.90, color: 'G', clarity: 'VVS2', cut: 'VERY_GOOD', price: 4200.00 },
    { certificateNumber: 'GIA-864209753', shape: 'PEAR', carat: 3.02, color: 'D', clarity: 'VS2', cut: 'EXCELLENT', price: 29500.00 },
    { certificateNumber: 'GIA-579135246', shape: 'PRINCESS', carat: 1.50, color: 'F', clarity: 'VVS1', cut: 'EXCELLENT', price: 11200.00 },
    { certificateNumber: 'GIA-314159265', shape: 'CUSHION', carat: 2.50, color: 'E', clarity: 'VS1', cut: 'VERY_GOOD', price: 19800.00 },
    { certificateNumber: 'GIA-271828182', shape: 'MARQUISE', carat: 1.05, color: 'H', clarity: 'SI1', cut: 'VERY_GOOD', price: 4900.00 },
    { certificateNumber: 'GIA-161803398', shape: 'RADIANT', carat: 1.75, color: 'G', clarity: 'VS2', cut: 'EXCELLENT', price: 9800.00 },
    { certificateNumber: 'GIA-999888777', shape: 'HEART', carat: 0.80, color: 'F', clarity: 'VVS2', cut: 'VERY_GOOD', price: 5200.00 },
    { certificateNumber: 'GIA-111222333', shape: 'ROUND', carat: 1.20, color: 'D', clarity: 'IF', cut: 'EXCELLENT', price: 9900.00 },
    { certificateNumber: 'GIA-444555666', shape: 'OVAL', carat: 2.20, color: 'E', clarity: 'VVS1', cut: 'EXCELLENT', price: 18900.00 },
    { certificateNumber: 'GIA-777888999', shape: 'EMERALD', carat: 1.40, color: 'F', clarity: 'VS1', cut: 'EXCELLENT', price: 9500.00 },
    { certificateNumber: 'GIA-121314151', shape: 'CUSHION', carat: 3.50, color: 'G', clarity: 'VVS2', cut: 'EXCELLENT', price: 34000.00 },
    { certificateNumber: 'GIA-161718192', shape: 'PEAR', carat: 0.70, color: 'H', clarity: 'VS2', cut: 'VERY_GOOD', price: 3100.00 },
  ];

  for (const g of gemstonesData) {
    await prisma.gemstone.upsert({
      where: { certificateNumber: g.certificateNumber },
      update: {},
      create: {
        type: 'DIAMOND',
        shape: g.shape,
        carat: g.carat,
        color: g.color,
        clarity: g.clarity,
        cut: g.cut,
        certificateNumber: g.certificateNumber,
        certificateUrl: 'https://res.cloudinary.com/demo/image/upload/v12345/gia_certificate_sample.pdf',
        price: g.price,
        status: 'AVAILABLE',
      }
    });
    console.log(`[Seed] Certified loose diamond registered: ${g.certificateNumber}`);
  }

  // 6. Create active discount coupons
  const launchCoupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      minOrderAmount: 1000.00,
      maxDiscountAmount: 500.00,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days active
      isActive: true,
      usageLimit: 100,
    },
  });
  console.log(`[Seed] Active Coupon generated: ${launchCoupon.code}`);

  console.log('[Seed] Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed Error] Seeding process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
