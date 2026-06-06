'use client';

import { t } from '@/lib/i18n-bn';

export function PromoBanner() {
  return (
    <a
      href="#products"
      className="kf-promo-gradient flex items-center justify-center group w-full py-2 font-medium text-sm text-[var(--kf-navy)] text-center hover:opacity-95 transition-opacity"
    >
      <div className="flex flex-wrap items-center gap-1.5 justify-center group-hover:bg-white/10 transition duration-300 px-4 py-1 rounded-full max-w-5xl">
        <p>{t.promoBanner}</p>
        <svg className="mt-px shrink-0" width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2.91797 7H11.0846" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M7 2.9165L11.0833 6.99984L7 11.0832"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  );
}
