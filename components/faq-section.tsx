'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { FaqItem } from '@/lib/types';
import { t } from '@/lib/i18n-bn';
import { DEFAULT_FAQ_IMAGE_DESKTOP, DEFAULT_FAQ_IMAGE_MOBILE } from '@/lib/defaults';

interface FaqSectionProps {
  items: FaqItem[];
  imageDesktop?: string;
  imageMobile?: string;
}

const FALLBACK_ITEMS: FaqItem[] = [
  { id: '1', question: t.faqShippingQ, answer: t.faqShippingA, sortOrder: 0 },
  { id: '2', question: t.faqReturnsQ, answer: t.faqReturnsA, sortOrder: 1 },
  { id: '3', question: t.faqExchangeQ, answer: t.faqExchangeA, sortOrder: 2 },
  { id: '4', question: t.faqTrackingQ, answer: t.faqTrackingA, sortOrder: 3 },
];

export function FaqSection({ items, imageDesktop, imageMobile }: FaqSectionProps) {
  const faqItems = items.length > 0 ? items : FALLBACK_ITEMS;
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter((item) => {
      const question = (item.questionBn || item.question).toLowerCase();
      const answer = (item.answerBn || item.answer).toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [search, faqItems]);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const faqDesktop = imageDesktop || DEFAULT_FAQ_IMAGE_DESKTOP;
  const faqMobile = imageMobile || DEFAULT_FAQ_IMAGE_MOBILE;

  return (
    <section id="faq" className="py-16 md:py-20 kf-section-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <h2 className="font-serif font-bold text-3xl lg:text-4xl kf-heading leading-tight">
          {t.faqTitle}
        </h2>

        <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <p className="text-base leading-6 kf-text-muted lg:w-8/12 md:w-9/12">{t.faqSub}</p>

          <div className="border-b-2 border-slate-200 dark:border-white/20 pb-2 flex items-center md:mt-0 mt-4 md:w-auto w-full">
            <input
              placeholder={t.faqSearch}
              type="search"
              aria-label={t.faqSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:w-96 md:w-72 w-full focus:outline-none placeholder-slate-500 dark:placeholder-white/50 text-base text-slate-700 dark:text-white leading-4 bg-transparent"
            />
            <Search className="shrink-0 w-4 h-4 text-slate-600 dark:text-white" aria-hidden />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-8 md:mt-16 mt-8 gap-10 md:gap-0">
          <div className="md:w-5/12 lg:w-4/12 w-full">
            <Image
              src={faqDesktop}
              alt={t.faqImageAlt}
              width={600}
              height={800}
              className="w-full hidden md:block rounded-lg object-cover"
            />
            <Image
              src={faqMobile}
              alt={t.faqImageAlt}
              width={600}
              height={400}
              className="w-full md:hidden block rounded-lg object-cover"
            />
          </div>

          <div className="md:w-7/12 lg:w-8/12 w-full md:mt-0">
            {filtered.length === 0 ? (
              <p className="text-slate-500 dark:text-white/70 text-sm py-8">{t.faqNoResults}</p>
            ) : (
              filtered.map((item, idx) => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-xl leading-5 text-slate-800 dark:text-white">
                        {item.questionBn || item.question}
                      </h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? t.faqCollapse : t.faqExpand}
                        onClick={() => toggle(item.id)}
                        className="text-slate-800 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 dark:focus:ring-white shrink-0 ml-4 p-1"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                          <path
                            d="M10 4.1665V15.8332"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={isOpen ? 'hidden' : undefined}
                          />
                          <path
                            d="M4.16602 10H15.8327"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <p
                      className={`font-normal text-base leading-6 text-slate-600 dark:text-white/80 mt-4 w-11/12 ${
                        isOpen ? 'block' : 'hidden'
                      }`}
                    >
                      {item.answerBn || item.answer}
                    </p>
                    {idx < filtered.length - 1 && (
                      <hr className="my-7 bg-slate-200 dark:bg-white/20 border-0 h-px" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
