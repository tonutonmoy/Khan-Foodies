import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_FAQ_IMAGE_DESKTOP,
  DEFAULT_FAQ_IMAGE_MOBILE,
  DEFAULT_HERO_IMAGES,
  DEFAULT_REVIEW_AVATAR,
} from '../lib/defaults';

const prisma = new PrismaClient();

const defaultCategories = [
  { id: 'cat-1', name: 'Fresh Mangoes', nameBn: 'তাজা মিষ্টি আম', icon: 'Leaf', slug: 'fresh-mangoes' },
  { id: 'cat-2', name: 'Mango Preserves', nameBn: 'আমের আচার ও চাটনি', icon: 'Container', slug: 'mango-preserves' },
  { id: 'cat-3', name: 'Premium Honey', nameBn: 'আমের মুকুলের বুনো মধু', icon: 'Droplets', slug: 'premium-honey' },
  { id: 'cat-4', name: 'Mango Superfoods', nameBn: 'আমের পুষ্টিকর সুপারফুড', icon: 'CalendarDays', slug: 'mango-superfoods' },
];

const defaultProducts = [
  {
    id: 'prod-1',
    name: 'Rajshahi Himsagar Premium Mango',
    nameBn: 'রাজশাহী প্রিমিয়াম হিমসাগর আম',
    price: 190,
    discount: 10,
    description: 'Sourced directly from certified heritage orchards of Rajshahi. Handpicked, chemical-free, sweet and aromatic.',
    descriptionBn: 'রাজশাহীর ঐতিহ্যবাহী বাগান থেকে সরাসরি সংগৃহীত সেরা মানের হিমসাগর আম। সম্পূর্ণ ফরমালিন ও রাসায়নিক মুক্ত, অত্যন্ত মিষ্টি ও সুস্বাদু স্বাদের নিশ্চয়তা।',
    category: 'Fresh Mangoes',
    stock: 50,
    status: 'Active',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'prod-2',
    name: 'Premium Gopalbhog Sweet Mango',
    nameBn: 'মিষ্টি গোপালভোগ প্রিমিয়াম আম',
    price: 170,
    discount: 5,
    description: 'Royal Gopalbhog Mango, famous for its rich golden skin, deep aroma, and buttery sweet flesh.',
    descriptionBn: 'গাঢ় সুগন্ধ এবং মাখনের মতো মসৃণ ও মিষ্টি শাঁসের জন্য বিখ্যাত ঐতিহ্যবাহী গোপালভোগ আম।',
    category: 'Fresh Mangoes',
    stock: 45,
    status: 'Active',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'prod-3',
    name: 'Organic Sweet Amrapali Mango',
    nameBn: 'অর্গানিক মিষ্টি আম্রপালি আম',
    price: 160,
    discount: 15,
    description: 'Premium organic Amrapali Mangoes premium-grade, fiberless, sweet-scented from organic farms.',
    descriptionBn: 'ফাইবারমুক্ত, অত্যন্ত মিষ্টি ও অতুলনীয় সুগন্ধযুক্ত প্রিমিয়াম কোয়ালিটির আম্রপালি আম।',
    category: 'Fresh Mangoes',
    stock: 80,
    status: 'Active',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'prod-4',
    name: 'Royal Mango Blossom Honey',
    nameBn: 'আমের মুকুলের খাঁটি বুনো মধু',
    price: 1100,
    discount: 12,
    description: 'Extremely rare honey collected by bees from organic mango blossoms in spring.',
    descriptionBn: 'বসন্তকালে আমের মুকুল থেকে মৌমাছিদের দ্বারা সংগৃহীত অত্যন্ত দুর্লভ ও সুগন্ধি মধু।',
    category: 'Premium Honey',
    stock: 25,
    status: 'Active',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'prod-5',
    name: 'Premium Sun-Dried Mango Bars (Amsotto)',
    nameBn: 'প্রিমিয়াম রোদে শুকানো আমসত্ত্ব',
    price: 450,
    discount: 0,
    description: 'Traditionally sun-dried layers of sweet ripe mango pulp. Zero added sugar or chemical preservatives.',
    descriptionBn: 'মিষ্টি পাকা আমের রস থেকে রোদে শুকিয়ে প্রস্তুত করা শতভাগ খাঁটি ধূলিকণামুক্ত মসৃণ আমসত্ত্ব।',
    category: 'Mango Superfoods',
    stock: 60,
    status: 'Active',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ec82a897?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'prod-6',
    name: 'Bespoke Homemade Mango Pickle',
    nameBn: 'সরিষার তেলে হাতে তৈরি আমের আচার',
    price: 350,
    discount: 5,
    description: 'Spicy signature homemade raw mango pickle submerged in premium cold-pressed mustard oil.',
    descriptionBn: 'ঐতিহ্যবাহী কাঠের ঘানির খাঁটি সরিষার তেলে ডুবানো হাতে তৈরি খোসাসহ চটপটা কাঁচা আমের আচার।',
    category: 'Mango Preserves',
    stock: 40,
    status: 'Active',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
  },
];

const defaultReviews = [
  {
    name: 'Zarif Rahman',
    rating: 5,
    text: 'Sourced their Rajshahi Himsagar Mango, they are extraordinarily sweet and pure. No trace of gas or chemical. Fully satisfied!',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    role: 'Verified Buyer',
    roleBn: 'যাচাইকৃত ক্রেতা',
  },
  {
    name: 'Sadia Islam',
    rating: 5,
    text: "The mango bar (Amsotto) is so smooth and pure, reminded me of my grandmother's handmade recipe! Incredible aroma.",
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'Regular Customer',
    roleBn: 'নিয়মিত গ্রাহক',
  },
  {
    name: 'Kamrul Hasan',
    rating: 5,
    text: 'The homemade mango pickle is superb! Submerged in raw ghani mustard oil, gives such an intense organic flavor with hot rice.',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
    role: 'Food Enthusiast',
    roleBn: 'খাদ্য প্রেমী',
  },
];

const defaultGallery = [
  {
    title: 'Premium Mango Orchard',
    titleBn: 'প্রিমিয়াম আমের বাগান',
    description: 'Handpicked mangoes from Rajshahi heritage orchards.',
    descriptionBn: 'রাজশাহীর ঐতিহ্যবাহী বাগান থেকে হাতে তোলা সেরা মানের আম।',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    slot: 1,
    sortOrder: 0,
  },
  {
    title: 'Pure Organic Honey',
    titleBn: 'খাঁটি অর্গানিক মধু',
    description: 'Rare honey collected from mango blossom fields.',
    descriptionBn: 'আমের মুকুল থেকে সংগৃহীত দুর্লভ ও সুগন্ধি মধু।',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    slot: 2,
    sortOrder: 1,
  },
  {
    title: 'Traditional Amsotto',
    titleBn: 'ঐতিহ্যবাহী আমসত্ত্ব',
    description: 'Sun-dried mango bars with zero preservatives.',
    descriptionBn: 'রোদে শুকানো, কোনো প্রিজারভেটিভ ছাড়াই খাঁটি আমসত্ত্ব।',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
    slot: 3,
    sortOrder: 2,
  },
];

const defaultFaq = [
  {
    question: 'Shipping',
    questionBn: 'ডেলিভারি',
    answer: 'We deliver across Bangladesh. Dhaka 1-2 days, other districts 2-4 business days.',
    answerBn: 'আমরা সারা বাংলাদেশে ডেলিভারি করি। ঢাকায় ১-২ দিন, অন্যান্য জেলায় ২-৪ কর্মদিবস।',
    sortOrder: 0,
  },
  {
    question: 'Returns',
    questionBn: 'রিটার্ন',
    answer: 'Report defects within 24 hours of delivery for refund or replacement.',
    answerBn: 'ডেলিভারির ২৪ ঘণ্টার মধ্যে ত্রুটি জানালে রিফান্ড বা প্রতিস্থাপন করা হবে।',
    sortOrder: 1,
  },
  {
    question: 'Exchange',
    questionBn: 'এক্সচেঞ্জ',
    answer: 'Wrong or damaged items can be exchanged with order proof and photos.',
    answerBn: 'ভুল বা ক্ষতিগ্রস্ত পণ্য অর্ডার প্রমাণ ও ছবি সহ এক্সচেঞ্জযোগ্য।',
    sortOrder: 2,
  },
  {
    question: 'Order Tracking',
    questionBn: 'অর্ডার ট্র্যাকিং',
    answer: 'You receive a tracking ID after order confirmation. Our team calls before delivery.',
    answerBn: 'অর্ডার কনফার্ম হলে ট্র্যাকিং আইডি পাবেন। ডেলিভারির আগে আমাদের টিম কল করবে।',
    sortOrder: 3,
  },
];

const defaultSiteContent = {
  id: 'main',
  heroHeadline: 'Premium Mango Shopping Experience',
  heroHeadlineBn: 'খাঁটি ও প্রাকৃতিক প্রিমিয়াম অর্গানিক আম সম্ভার',
  heroSubheadline: 'Discover extraordinary high-quality handpicked Rajshahi mangoes and sweet organic gourmet treats direct to your table.',
  heroSubheadlineBn: 'সরাসরি আমের রাজধানী রাজশাহী থেকে পরম যত্নে সংগৃহীত শতভাগ ফরমালিনমুক্ত মিষ্টি আম।',
  aboutTitle: 'Our Pure Mango Guarantee & Mission',
  aboutTitleBn: 'আমাদের বিশুদ্ধ আমের গ্যারান্টি ও মিশন',
  aboutText: 'Khan Foods provides handpicked premium-grade mangoes and organic fruit solutions directly from naturally grown orchards in Rajshahi and Chapainawabganj.',
  aboutTextBn: 'খান ফুডস সরাসরি রাজশাহী ও চাঁপাইনবাবগঞ্জের অরগানিক বাগান থেকে পরম যত্নে সংগৃহীত প্রিমিয়াম কোয়ালিটির আসল মিষ্টি আম পৌঁছে দেয়।',
  aboutImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=1000',
  bannerImage1: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=1000',
  bannerTagline1: 'SENSATIONAL HIMSAGAR',
  bannerTagline1Bn: 'আমের রাজা রাজশাহী থেকে',
  bannerTitle1: 'Rajshahi Premium Ripe Himsagar Mango',
  bannerTitle1Bn: 'প্রিমিয়াম রসাল ও মিষ্টি হিমসাগর আম',
  bannerImage2: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=1000',
  bannerTagline2: 'ORGANIC AMRAPALI CROP',
  bannerTagline2Bn: 'সেরা স্বাদের শতভাগ প্রাকৃতিক',
  bannerTitle2: 'Sweet Scented Fiberless Amrapali Mango',
  bannerTitle2Bn: 'ফাইবারমুক্ত পরম সুস্বাদু আম্রপালি আম',
  bannerImage3: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=1000',
  bannerTagline3: 'TRADITIONAL AMSOTTO BAR',
  bannerTagline3Bn: 'রোদে শুকানো খাঁটি স্বাদ',
  bannerTitle3: 'Pure Organic Sweet Mango Bars (Amsotto)',
  bannerTitle3Bn: 'রয়েল পাকা আমের ঐতিহ্যবাহী আমসত্ত্ব',
  contactEmail: 'support@khanfoods.com.bd',
  contactPhone: '+880 1712-345678',
  contactAddress: 'Khan Foods House, Road 12, Banani, Dhaka-1213, Bangladesh',
  contactAddressBn: 'খান ফুডস হাউজ, রোড ১২, বনানী, ঢাকা-১২১৩, বাংলাদেশ',
  facebookUrl: 'https://facebook.com/khanfoods',
  youtubeUrl: 'https://youtube.com/khanfoods',
  instagramUrl: 'https://instagram.com/khanfoods',
  footerText: '© 2026 Khan Foods. Crafted for ultimate pure luxury, wholesomeness, and standard-setting dietary health solutions locally.',
  footerTextBn: '© ২০২৬ খান ফুডস। শতভাগ খাঁটি, স্বাস্থ্যকর এবং সুস্বাদু পুষ্টিকর খাদ্যের বিশ্বস্ত ঠিকানা।',
  heroImage1: DEFAULT_HERO_IMAGES[0],
  heroImage2: DEFAULT_HERO_IMAGES[1],
  heroImage3: DEFAULT_HERO_IMAGES[2],
  heroImage4: DEFAULT_HERO_IMAGES[3],
  faqImageDesktop: DEFAULT_FAQ_IMAGE_DESKTOP,
  faqImageMobile: DEFAULT_FAQ_IMAGE_MOBILE,
  defaultReviewAvatar: DEFAULT_REVIEW_AVATAR,
};

async function main() {
  console.log('🌱 Seeding Khan Foods database...');

  for (const cat of defaultCategories) {
    const { id, ...data } = cat;
    await prisma.category.upsert({
      where: { id },
      create: cat,
      update: data,
    });
  }
  console.log(`✅ ${defaultCategories.length} categories seeded`);

  for (const prod of defaultProducts) {
    const { id, ...data } = prod;
    await prisma.product.upsert({
      where: { id },
      create: prod,
      update: data,
    });
  }
  console.log(`✅ ${defaultProducts.length} products seeded`);

  for (const rev of defaultReviews) {
    const existing = await prisma.review.findFirst({ where: { name: rev.name } });
    if (!existing) {
      await prisma.review.create({ data: rev });
    }
  }
  console.log(`✅ ${defaultReviews.length} reviews seeded`);

  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    for (const item of defaultGallery) {
      await prisma.galleryItem.create({ data: item });
    }
    console.log(`✅ ${defaultGallery.length} gallery items seeded`);
  }

  const faqCount = await prisma.faqItem.count();
  if (faqCount === 0) {
    for (const item of defaultFaq) {
      await prisma.faqItem.create({ data: item });
    }
    console.log(`✅ ${defaultFaq.length} FAQ items seeded`);
  }

  const { id: _siteId, ...siteData } = defaultSiteContent;
  await prisma.siteContent.upsert({
    where: { id: 'main' },
    create: defaultSiteContent,
    update: siteData,
  });
  console.log('✅ Site content seeded');

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    await prisma.order.create({
      data: {
        orderNumber: 'KF-2026-9041',
        customerName: 'Abrar Chowdhury',
        phone: '01812345678',
        address: 'Flat 4A, House 15, Road 2, Dhanmondi, Dhaka',
        items: [{ productId: 'prod-1', name: 'রাজশাহী প্রিমিয়াম হিমসাগর আম', price: 190, quantity: 5 }],
        amount: 950,
        status: 'Processing',
        notes: 'Please deliver after 4:00 PM',
      },
    });
    console.log('✅ Sample order seeded');
  }

  console.log('🎉 Database seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
