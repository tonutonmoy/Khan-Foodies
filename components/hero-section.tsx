'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlowLink } from '@/components/glow-button';
import { HeroInteractiveBg } from '@/components/hero-interactive-bg';
import { t } from '@/lib/i18n-bn';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1595981267035-7b04ec82a897?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=900&q=80',
];

const SLIDE_INTERVAL_MS = 5000;

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  images?: string[];
}

function HeroImageSlider({ slides }: { slides: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full max-w-[280px] sm:max-w-xs md:max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/25 shrink-0 mx-auto md:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero product gallery"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slides[index]}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index]}
            alt=""
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            priority={index === 0}
            sizes="(max-width: 768px) 280px, 384px"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-[#1a234d]/35 via-transparent to-transparent pointer-events-none" />

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-[var(--kf-peach)]' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroSection({ headline, subheadline, images = [] }: HeroSectionProps) {
  const uploaded = images.filter((url): url is string => Boolean(url?.trim()));
  const heroSlides = uploaded.length > 0 ? uploaded : FALLBACK_IMAGES;

  return (
    <section className="hero-section font-[family-name:var(--font-poppins)]">
      <HeroInteractiveBg />
      <main className="relative z-10 kf-container flex flex-col md:flex-row items-center max-md:text-center justify-between pt-8 pb-16 md:pt-12 px-2 sm:px-4 gap-10">
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

        <HeroImageSlider slides={heroSlides} />
      </main>
    </section>
  );
}
