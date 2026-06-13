import { Truck } from 'lucide-react';
import { t } from '@/lib/i18n-bn';

type FreeDeliveryBadgeProps = {
  className?: string;
  size?: 'sm' | 'md';
};

export function FreeDeliveryBadge({ className = '', size = 'sm' }: FreeDeliveryBadgeProps) {
  const sizeClass =
    size === 'md'
      ? 'text-xs px-2.5 py-1 gap-1.5'
      : 'text-[10px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-wide bg-emerald-600 text-white rounded-full shadow-sm ${sizeClass} ${className}`}
    >
      <Truck className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} aria-hidden />
      {t.freeDeliveryBadge}
    </span>
  );
}
