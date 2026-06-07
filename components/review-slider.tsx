'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Review } from '@/lib/types';
import { t } from '@/lib/i18n-bn';
import { DEFAULT_REVIEW_AVATAR } from '@/lib/defaults';

interface ReviewSliderProps {
  reviews: Review[];
}

export function ReviewSlider({ reviews }: ReviewSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [navShift, setNavShift] = useState(false);

  const go = useCallback(
    (direction: 'prev' | 'next') => {
      if (reviews.length <= 1 || animating) return;

      setAnimating(true);
      setNavShift(true);

      setTimeout(() => {
        setCurrentIndex((prev) => {
          if (direction === 'prev') {
            return (reviews.length + prev - 1) % reviews.length;
          }
          return (prev + 1) % reviews.length;
        });
        setAnimating(false);
        setNavShift(false);
      }, 500);
    },
    [reviews.length, animating]
  );

  if (reviews.length === 0) {
    return (
      <p className="text-slate-400 text-sm py-8 text-center">{t.noReviews}</p>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">{t.reviewSliderTitle}</h2>
        <p className="text-sm text-slate-600 mt-1">{t.reviewSliderSub}</p>
      </div>

      <div
        className="mt-6 grid grid-cols-1 sm:grid-cols-[60px_auto_60px] gap-2 sm:gap-6
          [grid-template-areas:'slider_slider'_'nav-left_nav-right']
          sm:[grid-template-areas:'nav-left_slider_nav-right']"
      >
        <button
          type="button"
          aria-label="Previous review"
          onClick={() => go('prev')}
          disabled={reviews.length <= 1}
          className={`[grid-area:nav-left] rounded-full w-10 h-10 shrink-0 text-slate-600 text-2xl
            relative isolate bg-black sm:mt-8 transition-all duration-500
            before:absolute before:inset-px before:transition-all before:duration-300 before:-z-10
            before:rounded-full hover:before:inset-full before:bg-white
            hover:text-white hover:bg-[var(--kf-navy)] hover:border-[var(--kf-navy)]
            flex items-center justify-center cursor-pointer disabled:opacity-40
            ${navShift ? 'translate-x-20' : ''}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="[grid-area:slider] overflow-hidden">
          <div className="grid [grid-template-areas:'stack']">
            {reviews.map((review, idx) => {
              const isActive = idx === currentIndex;
              const hidden = !isActive || animating;

              return (
                <div
                  key={review.id}
                  className={`[grid-area:stack] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <blockquote
                    className={`bg-black text-white rounded-md p-6 text-sm relative isolate transition-all duration-500
                      before:absolute before:bg-black before:w-4 before:h-4 before:rotate-45
                      before:-bottom-2 before:left-2/4 before:-translate-x-2/4 before:-z-10
                      before:transition before:duration-500 before:delay-500
                      ${hidden ? 'scale-0 before:-translate-y-full' : 'scale-100'}`}
                  >
                    &ldquo;{review.text}&rdquo;
                  </blockquote>

                  <div
                    className={`details text-sm flex flex-col items-center gap-2 mt-6 transition-all duration-500
                      ${hidden ? 'translate-y-[150px] scale-0' : 'translate-y-0 scale-100'}`}
                  >
                    <Image
                      src={review.image || DEFAULT_REVIEW_AVATAR}
                      alt={review.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900">{review.name}</p>
                      <p className="text-xs text-slate-500">
                        {review.roleBn || review.role || t.verifiedBuyer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label="Next review"
          onClick={() => go('next')}
          disabled={reviews.length <= 1}
          className={`[grid-area:nav-right] rounded-full w-10 h-10 shrink-0 text-slate-600 text-2xl
            relative isolate bg-black sm:mt-8 transition-all duration-500
            before:absolute before:inset-px before:transition-all before:duration-300 before:-z-10
            before:rounded-full hover:before:inset-full before:bg-white
            hover:text-white hover:bg-[var(--kf-navy)] hover:border-[var(--kf-navy)]
            flex items-center justify-center cursor-pointer disabled:opacity-40
            ${navShift ? '-translate-x-20' : ''}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
