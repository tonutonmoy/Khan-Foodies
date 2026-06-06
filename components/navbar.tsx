'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Search, Moon, Sun } from 'lucide-react';
import { GlowLink } from '@/components/glow-button';
import { Logo } from '@/components/logo';
import { useTheme } from '@/components/theme-provider';
import { t } from '@/lib/i18n-bn';

interface NavbarProps {
  cartCount: number;
  onCartOpen: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const NAV_LINKS = [
  { href: '#products', label: t.navProducts },
  { href: '#gallery', label: t.galleryTitle },
  { href: '#reviews', label: t.navReviews },
  { href: '#faq', label: t.navFaq },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <a href={href} onClick={onClick} className="relative overflow-hidden h-6 group text-[var(--kf-text)]">
      <span className="block group-hover:-translate-y-full transition-transform duration-300">{label}</span>
      <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300 text-[var(--kf-accent)]">
        {label}
      </span>
    </a>
  );
}

export function Navbar({ cartCount, onCartOpen, searchQuery, onSearchChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 py-3">
      <nav className="kf-surface-nav relative flex items-center border mx-auto max-w-7xl max-md:w-full max-md:justify-between backdrop-blur-md px-3 sm:px-5 py-2 sm:py-3 rounded-2xl sm:rounded-full text-sm">
        <Link href="/" className="shrink-0 flex items-center" onClick={closeMobile}>
          <Logo height={40} priority className="rounded-lg" />
        </Link>

        <div className="hidden md:flex items-center gap-5 lg:gap-6 ml-6 lg:ml-8">
          <NavLink href="#categories" label={t.navHome} />
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        <div className="hidden lg:flex relative ml-6 max-w-[11rem] w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--kf-text-muted)] pointer-events-none" />
          <input
            type="search"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full kf-input rounded-full pl-9 pr-3 py-1.5 text-xs placeholder:text-[var(--kf-text-muted)] focus:outline-none focus:border-[var(--kf-navy)]"
          />
        </div>

        <div className="hidden md:flex items-center gap-2 lg:gap-3 ml-auto lg:ml-6 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="kf-btn-outline p-2 rounded-full transition"
            aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onCartOpen}
            className="relative kf-btn-outline p-2 rounded-full transition"
            aria-label={t.cart}
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--kf-accent)] text-[var(--kf-navy)] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          <a href="#contact" className="kf-btn kf-btn-outline kf-btn--sm whitespace-nowrap">
            {t.navContact}
          </a>

          <GlowLink href="#products" innerClassName="text-sm px-4 py-2 whitespace-nowrap">
            {t.shopNow}
          </GlowLink>

          <Link
            href="/admin"
            className="hidden xl:inline text-xs text-[var(--kf-text-muted)] hover:text-[var(--kf-navy)] font-medium transition whitespace-nowrap"
          >
            {t.loginAdmin}
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2 ml-auto">
          <button type="button" onClick={toggleTheme} className="p-2 text-[var(--kf-text)]" aria-label={theme === 'dark' ? t.themeLight : t.themeDark}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button type="button" onClick={onCartOpen} className="relative p-2 text-[var(--kf-text)]" aria-label={t.cart}>
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[var(--kf-accent)] text-[var(--kf-navy)] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="text-[var(--kf-text)] p-1"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-[color-mix(in_srgb,var(--kf-peach-soft)_95%,transparent)] dark:bg-[color-mix(in_srgb,var(--kf-surface)_95%,transparent)] border border-[color-mix(in_srgb,var(--kf-navy)_15%,transparent)] backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center gap-4 md:hidden shadow-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--kf-text-muted)]" />
              <input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full kf-input rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-[var(--kf-text-muted)] focus:outline-none focus:border-[var(--kf-navy)]"
              />
            </div>

            <NavLink href="#categories" label={t.navHome} onClick={closeMobile} />
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} onClick={closeMobile} />
            ))}

            <a href="#contact" onClick={closeMobile} className="w-full text-center kf-btn kf-btn-outline kf-btn--sm">
              {t.navContact}
            </a>

            <GlowLink href="#products" className="w-full" innerClassName="w-full text-center text-sm px-4 py-2.5" onClick={closeMobile}>
              {t.shopNow}
            </GlowLink>

            <Link href="/admin" onClick={closeMobile} className="text-[var(--kf-navy)] dark:text-[var(--kf-peach)] text-sm font-semibold">
              {t.loginAdmin}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
