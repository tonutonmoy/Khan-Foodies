'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { GlowLink } from '@/components/glow-button';
import { HeroInteractiveBg } from '@/components/hero-interactive-bg';
import { t } from '@/lib/i18n-bn';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=735&q=80',
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=687&q=80',
  'https://images.unsplash.com/photo-1595981267035-7b04ec82a897?auto=format&fit=crop&w=687&q=80',
  'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=687&q=80',
];

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  images?: string[];
}

export function HeroSection({ headline, subheadline, images = [] }: HeroSectionProps) {
  const heroImages = [...images, ...FALLBACK_IMAGES].slice(0, 4);

  return (
    <section className="hero-section font-[family-name:var(--font-poppins)]">
      <HeroInteractiveBg />
      <main className="relative z-10 flex flex-col md:flex-row items-center max-md:text-center justify-between pt-8 pb-16 md:pt-12 px-6 sm:px-10 md:px-16 lg:px-24 max-w-7xl mx-auto w-full gap-10">
        <div className="flex flex-col items-center md:items-start max-w-xl">
          <a
            href="#products"
            className="mb-6 flex items-center space-x-2 border border-white/40 text-white text-xs rounded-full px-4 pr-1.5 py-1.5 hover:bg-white/10 transition backdrop-blur-sm"
          >
            <span>{t.heroBadge}</span>
            <span className="flex items-center justify-center size-6 p-1 rounded-full bg-[var(--kf-peach)]">
              <svg width="14" height="11" viewBox="0 0 16 13" fill="none" aria-hidden>
                <path
                  d="M1 6.5h14M9.5 1 15 6.5 9.5 12"
                  stroke="#1a234d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>

          <h1 className="text-[var(--kf-hero-text)] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
            {headline ? (
              headline
            ) : (
              <>
                {t.heroLead}{' '}
                <span className="text-[var(--kf-peach)]">{t.heroAccent}</span>
              </>
            )}
          </h1>

          <p className="mt-4 text-[var(--kf-hero-text-muted)] max-w-md text-sm sm:text-base leading-relaxed">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center mt-8 gap-3 w-full sm:w-auto">
            <GlowLink
              href="#products"
              innerClassName="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {t.heroCtaStories}
              <ArrowRight className="w-5 h-5" aria-hidden />
            </GlowLink>
            <a
              href="#contact"
              className="kf-btn kf-btn-hero-outline kf-btn--md w-full sm:w-auto text-center"
            >
              {t.heroCtaStart}
            </a>
          </div>
        </div>

        <div
          aria-label="Khan Foods products"
          className="grid grid-cols-2 gap-4 sm:gap-6 pb-2 shrink-0"
        >
          {heroImages.map((src, i) => (
            <Image
              key={`${src}-${i}`}
              src={src}
              alt=""
              width={144}
              height={176}
              className="w-28 h-36 sm:w-36 sm:h-44 rounded-lg hover:scale-105 transition duration-300 object-cover shadow-lg ring-2 ring-white/20"
              referrerPolicy="no-referrer"
              priority={i < 2}
              sizes="144px"
            />
          ))}
        </div>
      </main>
    </section>
  );
}
