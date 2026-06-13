'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { t } from '@/lib/i18n-bn';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function AppInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem('kf_app_install_dismissed') === '1') return;

    if (isIos()) {
      setShowIosHint(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem('kf_app_install_dismissed', '1');
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    setDeferredPrompt(null);
  };

  if (dismissed || !visible || isStandalone()) return null;

  return (
    <section
      id="app-download"
      className="mx-4 sm:mx-6 max-w-7xl lg:mx-auto mb-8 scroll-mt-24"
      aria-label={t.appInstallTitle}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--kf-border)] bg-gradient-to-r from-[var(--kf-navy)] to-[#243066] text-white shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,var(--kf-peach),transparent_50%)]" />

        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="shrink-0 w-11 h-11 rounded-xl bg-[var(--kf-peach)]/25 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[var(--kf-peach)]" aria-hidden />
            </span>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-black leading-tight">{t.appInstallTitle}</h3>
              <p className="text-sm text-white/75 mt-1">{t.appInstallSub}</p>
              {showIosHint && (
                <p className="text-xs text-[var(--kf-peach)] mt-2 font-medium">{t.appInstallIosHint}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!showIosHint && deferredPrompt && (
              <button
                type="button"
                onClick={() => void install()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--kf-peach)] text-[var(--kf-navy)] text-sm font-black uppercase tracking-wide hover:brightness-105 transition"
              >
                <Download className="w-4 h-4" aria-hidden />
                {t.appInstallBtn}
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="p-2 rounded-lg hover:bg-white/10 transition text-white/70"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
