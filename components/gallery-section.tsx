'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/lib/types';
import { t } from '@/lib/i18n-bn';

interface GallerySectionProps {
  items: GalleryItem[];
}

const FALLBACK_ITEMS: Pick<GalleryItem, 'title' | 'titleBn' | 'image'>[] = [
  {
    title: 'Premium Mango Orchard',
    titleBn: 'প্রিমিয়াম আমের বাগান',
    image: 'https://images.unsplash.com/photo-1543487945-139a97f387d5?w=1200&auto=format&fit=crop&q=60',
  },
  {
    title: 'Pure Organic Honey',
    titleBn: 'খাঁটি অর্গানিক মধু',
    image: 'https://images.unsplash.com/photo-1529254479751-faeedc59e78f?w=1200&auto=format&fit=crop&q=60',
  },
  {
    title: 'Traditional Amsotto',
    titleBn: 'ঐতিহ্যবাহী আমসত্ত্ব',
    image: 'https://images.unsplash.com/photo-1618327907215-4e514efabd41?w=1200&auto=format&fit=crop&q=60',
  },
  {
    title: 'Fresh Farm Products',
    titleBn: 'তাজা খামারের পণ্য',
    image: 'https://images.unsplash.com/photo-1583407723467-9b2d22504831?w=1200&auto=format&fit=crop&q=60',
  },
];

type MarqueeCard = {
  key: string;
  title: string;
  image: string;
};

export function GallerySection({ items }: GallerySectionProps) {
  const [stopScroll, setStopScroll] = useState(false);

  const source = items.length > 0 ? items : FALLBACK_ITEMS;
  const cards: MarqueeCard[] = source.map((item, i) => ({
    key: 'id' in item && item.id ? String(item.id) : `fallback-${i}`,
    title: item.titleBn || item.title,
    image: item.image,
  }));

  const duplicated = [...cards, ...cards];
  const durationMs = cards.length * 2500;

  return (
    <section id="gallery" className="py-16 md:py-20 kf-section-muted border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="kf-badge mb-3">
          {t.galleryBadge}
        </span>
        <h2 className="font-serif font-bold text-3xl lg:text-4xl kf-heading">{t.galleryTitle}</h2>
        <p className="kf-text-muted mt-3 max-w-2xl mx-auto">{t.gallerySub}</p>
      </div>

      <div
        className="overflow-hidden w-full relative max-w-6xl mx-auto"
        onMouseEnter={() => setStopScroll(true)}
        onMouseLeave={() => setStopScroll(false)}
      >
        <div className="absolute left-0 top-0 h-full w-16 sm:w-20 z-10 pointer-events-none bg-gradient-to-r from-[var(--kf-section-bg)] to-transparent" />
        <div className="absolute right-0 top-0 h-full w-16 sm:w-40 z-10 pointer-events-none bg-gradient-to-l from-[var(--kf-section-bg)] to-transparent" />

        <div
          className={`gallery-marquee-inner flex w-fit ${stopScroll ? 'is-paused' : ''}`}
          style={{ animationDuration: `${durationMs}ms` }}
        >
          <div className="flex">
            {duplicated.map((card, index) => (
              <div
                key={`${card.key}-${index}`}
                className="w-52 sm:w-56 mx-3 sm:mx-4 h-72 sm:h-[20rem] relative group hover:scale-95 transition-all duration-300 shrink-0 overflow-hidden rounded-lg shadow-md"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="224px"
                />
                <div className="flex items-center justify-center px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute inset-0 backdrop-blur-md bg-black/25">
                  <p className="text-white text-base sm:text-lg font-semibold text-center leading-snug">
                    {card.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
