'use client';

import Link from 'next/link';
import { Category, SiteContent } from '@/lib/types';
import { Logo } from '@/components/logo';
import { t } from '@/lib/i18n-bn';

interface FooterProps {
  siteContent: SiteContent | null;
  categories: Category[];
  onCategorySelect?: (name: string) => void;
}

function SocialIcon({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href || href === '#') return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-[var(--kf-peach-light)] hover:text-[var(--kf-peach)] transition" aria-label={label}>
      {children}
    </a>
  );
}

export function Footer({ siteContent, categories, onCategorySelect }: FooterProps) {
  const fb = siteContent?.facebookUrl;
  const ig = siteContent?.instagramUrl;
  const yt = siteContent?.youtubeUrl;

  return (
    <div className="font-[family-name:var(--font-geist)] bg-[var(--kf-footer-outer)] pt-16 sm:pt-20 px-4">
      <footer className="bg-[var(--kf-surface)] w-full max-w-[1350px] mx-auto text-white pt-8 lg:pt-12 px-4 sm:px-8 md:px-16 lg:px-28 rounded-tl-3xl rounded-tr-3xl overflow-hidden pb-4 border border-[var(--kf-surface-border)]">
        <div className="kf-container grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-12">
          <div className="lg:col-span-3 space-y-6">
            <Link href="/" className="inline-block">
              <Logo height={56} className="rounded-xl" />
            </Link>

            <p className="text-sm/6 text-[var(--kf-peach-light)] max-w-96 opacity-90">{t.footerDesc}</p>

            <p className="text-sm text-white/70">
              {siteContent?.contactAddressBn || siteContent?.contactAddress}
            </p>
            <p className="text-sm font-semibold text-[var(--kf-peach)]">
              {siteContent?.contactPhone || '+880 1712-345678'}
            </p>

            <div className="flex gap-5 md:gap-6">
              <SocialIcon href={fb} label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2V2C24,0.895,23.105,0,22,0z" />
                </svg>
              </SocialIcon>

              <SocialIcon href={yt} label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </SocialIcon>

              <SocialIcon href={ig} label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start">
            <div>
              <h3 className="font-medium text-sm mb-4 text-[var(--kf-peach)]">{t.footerQuickLinks}</h3>
              <ul className="space-y-3 text-sm text-white/75">
                <li><a href="#categories" className="hover:text-[var(--kf-peach)] transition">{t.footerProducts}</a></li>
                <li><a href="#products" className="hover:text-[var(--kf-peach)] transition">{t.footerShowcase}</a></li>
                <li><a href="#gallery" className="hover:text-[var(--kf-peach)] transition">{t.galleryTitle}</a></li>
                <li><a href="#reviews" className="hover:text-[var(--kf-peach)] transition">{t.footerStories}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-4 text-[var(--kf-peach)]">{t.footerCategories}</h3>
              <ul className="space-y-3 text-sm text-white/75">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onCategorySelect?.(cat.name);
                        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-[var(--kf-peach)] transition text-left cursor-pointer"
                    >
                      {cat.nameBn || cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="font-medium text-sm mb-4 text-[var(--kf-peach)]">{t.footerSupport}</h3>
              <ul className="space-y-3 text-sm text-white/75">
                <li><a href="#app-download" className="hover:text-[var(--kf-peach)] transition">{t.appInstallTitle}</a></li>
                <li><a href="#about" className="hover:text-[var(--kf-peach)] transition">{t.aboutBadge}</a></li>
                <li><a href="#faq" className="hover:text-[var(--kf-peach)] transition">{t.faqTitle}</a></li>
                <li className="flex items-center gap-2 flex-wrap">
                  <a href="#contact" className="hover:text-[var(--kf-peach)] transition">{t.navContact}</a>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--kf-navy-dark)] border border-[var(--kf-peach)]/50 text-[var(--kf-peach)]">
                    COD
                  </span>
                </li>
                <li><a href="#contact" className="hover:text-[var(--kf-peach)] transition">{t.privacy}</a></li>
                <li>
                  <Link href="/admin" className="hover:text-[var(--kf-peach)] transition text-[var(--kf-peach)] font-medium">
                    {t.secretAdmin}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="kf-container mt-12 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/50 text-sm text-center sm:text-left">
            {siteContent?.footerTextBn || siteContent?.footerText || '© ২০২৬ Khan Foodies।'}
          </p>
          <p className="text-sm text-white/50">{t.footerRights}</p>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl h-full max-h-64 bg-[var(--kf-peach)] rounded-full blur-[170px] pointer-events-none opacity-25" />
          <h3
            className="text-center font-extrabold leading-[0.7] text-transparent text-[clamp(3rem,15vw,12rem)] [-webkit-text-stroke:1px_var(--kf-peach)] mt-6 select-none opacity-30"
            aria-hidden
          >
            KHAN FOODIES
          </h3>
        </div>
      </footer>
    </div>
  );
}
