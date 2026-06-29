import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding database elements (MySQL production mode)...');

  // Clear existing database entries in reverse dependency order
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
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.gemstone.deleteMany({});
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany({ where: { parentId: null } });
  await prisma.collection.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.newsletter.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.brand.deleteMany({});

  // 1. Create User Roles
  const adminRole = await prisma.role.create({ data: { name: 'ADMIN' } });
  const gemologistRole = await prisma.role.create({ data: { name: 'GEMOLOGIST' } });
  const managerRole = await prisma.role.create({ data: { name: 'ORDER_MANAGER' } });
  const customerRole = await prisma.role.create({ data: { name: 'CUSTOMER' } });

  console.log('[Seed] Predefined roles provisioned.');

  // 2. Create Default Administrative and Staff Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@Luxury123', salt);
  const gemPasswordHash = await bcrypt.hash('Gem@Luxury123', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@luxurybrand.com',
      name: 'Luxury Admin Team',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      roleId: adminRole.id,
      isEmailVerified: true,
      profile: {
        create: {
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          kycStatus: 'APPROVED',
        },
      },
      cart: {
        create: {},
      },
    },
  });

  const gemologistUser = await prisma.user.create({
    data: {
      email: 'gemologist@luxurybrand.com',
      name: 'Elena Rostova, GIA GG',
      passwordHash: gemPasswordHash,
      role: 'GEMOLOGIST',
      roleId: gemologistRole.id,
      isEmailVerified: true,
      profile: {
        create: {
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
          kycStatus: 'APPROVED',
        },
      },
      cart: {
        create: {},
      },
    },
  });

  console.log(`[Seed] System users provisioned: Admin (${adminUser.email}), Gemologist (${gemologistUser.email})`);

  // 3. Create Brands
  const cartier = await prisma.brand.create({
    data: {
      name: 'Cartier',
      slug: 'cartier',
      description: 'The King of Jewelers, and the Jeweler of Kings.',
      imageUrl: 'https://images.unsplash.com/photo-1588444839799-eb0c991a16a7?q=80&w=400&auto=format&fit=crop',
    },
  });

  const bvlgari = await prisma.brand.create({
    data: {
      name: 'Bvlgari',
      slug: 'bvlgari',
      description: 'Italian luxury brand known for its exquisite jewelry, watches, fragrances, and accessories.',
      imageUrl: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop',
    },
  });

  const tiffany = await prisma.brand.create({
    data: {
      name: 'Tiffany & Co.',
      slug: 'tiffany-and-co',
      description: 'America\'s leading jeweler since 1837, celebrated for its legendary design and diamonds.',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop',
    },
  });

  console.log('[Seed] Luxury Brands seeded.');

  // 4. Create Categories Tree Hierarchy
  const goldJewellery = await prisma.category.create({
    data: {
      name: 'Gold Jewellery',
      slug: 'gold-jewellery',
      description: 'Pure 18k and 22k gold jewelry including chains, bangles and rings.',
    },
  });

  const diamondJewellery = await prisma.category.create({
    data: {
      name: 'Diamond Jewellery',
      slug: 'diamond-jewellery',
      description: 'Certified VVS-VS solitaire diamonds set in premium white gold and platinum.',
    },
  });

  const ringsCat = await prisma.category.create({
    data: {
      name: 'Rings',
      slug: 'rings',
      description: 'Exquisite diamond, gold and platinum rings crafted for all occasions.',
    },
  });

  const engagementRings = await prisma.category.create({
    data: {
      name: 'Engagement Rings',
      slug: 'engagement-rings',
      description: 'Elegant custom designer solitaire and halo engagement rings.',
      parentId: ringsCat.id,
    },
  });

  const necklacesCat = await prisma.category.create({
    data: {
      name: 'Necklaces & Pendants',
      slug: 'necklaces',
      description: 'Chains, classic lockets, and bespoke diamond encrusted pendants.',
    },
  });

  console.log('[Seed] Categories hierarchy seeded.');

  // 5. Create Product Collections
  const bridalCollection = await prisma.collection.create({
    data: {
      name: 'Bridal Collection',
      slug: 'bridal-collection',
      description: 'Handcrafted engagement settings and wedding bands to mark forever.',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    },
  });

  const limitedCollection = await prisma.collection.create({
    data: {
      name: 'Limited Edition Collection',
      slug: 'limited-edition',
      description: 'Exclusive, rare diamond acquisitions and master artisan releases.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    },
  });

  console.log('[Seed] Collections seeded.');

  // 6. Create Baseline Customizable Product Settings
  const settingsData = [
    {
      name: 'Classic Solitaire Setting',
      slug: 'classic-solitaire-setting',
      sku: 'SET-SOL-001',
      description: 'A timeless four-prong setting matching standard round and oval cut center stone shapes.',
      basePrice: 950.00,
      brandId: tiffany.id,
      categoryId: engagementRings.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop', altText: 'Classic Solitaire Diamond Ring Front View', isHero: true },
        { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop', altText: 'Classic Solitaire Diamond Ring Angle View', isHero: false }
      ],
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
      brandId: bvlgari.id,
      categoryId: engagementRings.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop', altText: 'Sapphire Halo Ring Front View', isHero: true }
      ],
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
      brandId: cartier.id,
      categoryId: ringsCat.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=600&auto=format&fit=crop', altText: 'Pave Diamond Band View', isHero: true }
      ],
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
      brandId: cartier.id,
      categoryId: engagementRings.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop', altText: 'Emerald Cut Setting', isHero: true }
      ],
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
      brandId: tiffany.id,
      categoryId: goldJewellery.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=600&auto=format&fit=crop', altText: 'Eternal Gold Band', isHero: true }
      ],
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
    await prisma.product.create({
      data: {
        name: s.name,
        slug: s.slug,
        sku: s.sku,
        description: s.description,
        basePrice: s.basePrice,
        isCustomizable: true,
        categoryId: s.categoryId,
        brandId: s.brandId,
        status: 'ACTIVE',
        collections: {
          connect: { id: bridalCollection.id },
        },
        images: {
          create: s.images
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

  // 7. Create Certified Loose Gemstones Vault
  const gemstonesData = [
    { certificateNumber: 'GIA-123456789', shape: 'ROUND', carat: 1.25, color: 'D', clarity: 'VVS1', cut: 'EXCELLENT', price: 8500.00 },
    { certificateNumber: 'GIA-987654321', shape: 'ROUND', carat: 1.80, color: 'E', clarity: 'IF', cut: 'EXCELLENT', price: 14500.00 },
    { certificateNumber: 'GIA-246813579', shape: 'OVAL', carat: 2.10, color: 'F', clarity: 'VS1', cut: 'EXCELLENT', price: 16200.00 },
    { certificateNumber: 'GIA-135792468', shape: 'EMERALD', carat: 0.90, color: 'G', clarity: 'VVS2', cut: 'VERY_GOOD', price: 4200.00 },
    { certificateNumber: 'GIA-864209753', shape: 'PEAR', carat: 3.02, color: 'D', clarity: 'VS2', cut: 'EXCELLENT', price: 29500.00 },
    { certificateNumber: 'GIA-579135246', shape: 'PRINCESS', carat: 1.50, color: 'F', clarity: 'VVS1', cut: 'EXCELLENT', price: 11200.00 },
    { certificateNumber: 'GIA-314159265', shape: 'CUSHION', carat: 2.50, color: 'E', clarity: 'VS1', cut: 'VERY_GOOD', price: 19800.00 },
  ];

  for (const g of gemstonesData) {
    await prisma.gemstone.create({
      data: {
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

  // 8. Create active discount coupons
  const launchCoupon = await prisma.coupon.create({
    data: {
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

  // 9. Seed Blogs
  const blogPosts = [
    {
      title: 'The Art of Sourcing Conflict-Free Diamonds',
      slug: 'art-of-sourcing-conflict-free-diamonds',
      summary: 'Learn about our rigorous verification process and relationship with GIA certified ethical diamond mines.',
      content: 'At BeyondCarat, we believe luxury should be beautiful inside and out. That is why 100% of our diamonds are sourced through ethical, conflict-free channels under the Kimberley Process. In this article, Elena Rostova, our Head Gemologist, breaks down the steps to verify diamond ethical standards and how we inspect each laser inscription in our Fifth Avenue vault.',
      authorName: 'Elena Rostova, GIA GG',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
      publishedAt: new Date(),
    },
    {
      title: 'Platinum vs Gold: Choosing the Perfect Metal Setting',
      slug: 'platinum-vs-gold-choosing-perfect-metal-setting',
      summary: 'An administrative guide comparing metal density, hypoallergenic properties, and long-term care routines.',
      content: 'Platinum and 18k Gold are the gold standards of luxury bridal bands. But which fits your daily life best? While White Gold offers a brilliant reflective sheen, Platinum is heavier, hypoallergenic, and develops a beautiful satin patina over time. Explore our metal properties breakdown and choose the metal adjustments that balance aesthetics with longevity.',
      authorName: 'Luxury Concierge Team',
      imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop',
      publishedAt: new Date(),
    },
    {
      title: 'Understanding Solitaire Settings and Gem Shapes',
      slug: 'understanding-solitaire-settings-and-gem-shapes',
      summary: 'A curation of four-prong versus six-prong settings and how shapes like Cushion or Oval affect center stone reflection.',
      content: 'Solitaire rings are the epitome of timeless minimalism. However, styling them requires a keen understanding of prongs and stone geometry. Learn how a standard round brilliant diamond sparkles best in a four-prong basket setting, and why an elongated oval requires customized edge claws to prevent damage and optimize light performance.',
      authorName: 'Bespoke Design Studio',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      publishedAt: new Date(),
    }
  ];

  for (const b of blogPosts) {
    await prisma.blog.create({ data: b });
    console.log(`[Seed] Blog seeded: ${b.title}`);
  }

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
