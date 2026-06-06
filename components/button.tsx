'use client';

import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'outline-dark' | 'outline-hero' | 'filter' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'kf-btn--sm',
  md: 'kf-btn--md',
  lg: 'kf-btn--lg',
};

const glowWrapClass = 'glow-button-wrap inline-block';

const glowInnerBase =
  'glow-button-inner block rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed';

function join(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  active = false,
  fullWidth = false,
  glow = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? 'w-full' : '';

  if (variant === 'primary' && glow) {
    return (
      <div className={join(glowWrapClass, widthClass, className, disabled && 'opacity-55 pointer-events-none')}>
        <button type={type} disabled={disabled} className={join('block', widthClass)} {...props}>
          <span className={join(glowInnerBase, sizeClasses[size], widthClass && 'w-full text-center')}>
            {children}
          </span>
        </button>
      </div>
    );
  }

  const variantClass =
    variant === 'outline'
      ? 'kf-btn-outline-page'
      : variant === 'outline-dark'
        ? 'kf-btn-outline'
        : variant === 'outline-hero'
          ? 'kf-btn-hero-outline'
          : variant === 'filter'
            ? active
              ? 'kf-btn-filter kf-btn-filter--active'
              : 'kf-btn-filter'
            : variant === 'ghost'
              ? 'kf-btn-ghost'
              : 'kf-btn-solid';

  return (
    <button
      type={type}
      disabled={disabled}
      className={join('kf-btn', variantClass, sizeClasses[size], widthClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}

type GlowLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  innerClassName?: string;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function GlowLink({
  children,
  className = '',
  innerClassName = '',
  size = 'md',
  onClick,
  ...props
}: GlowLinkProps) {
  return (
    <div className={join(glowWrapClass, className)}>
      <a {...props} onClick={onClick} className="block">
        <span className={join(glowInnerBase, sizeClasses[size], innerClassName)}>{children}</span>
      </a>
    </div>
  );
}
