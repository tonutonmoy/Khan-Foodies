import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

type GlowButtonProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  href?: string;
  disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

const wrapClass = 'glow-button-wrap inline-block';

const innerClass =
  'glow-button-inner block rounded-full px-6 sm:px-8 py-2.5 sm:py-3 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed';

export function GlowButton({
  children,
  className = '',
  innerClassName = '',
  href,
  disabled,
  type = 'button',
  ...buttonProps
}: GlowButtonProps) {
  const content = <span className={`${innerClass} ${innerClassName}`}>{children}</span>;

  if (href && !disabled) {
    return (
      <div className={`${wrapClass} ${className}`}>
        <a href={href} className="block">
          {content}
        </a>
      </div>
    );
  }

  return (
    <div className={`${wrapClass} ${className}${disabled ? ' opacity-55 pointer-events-none' : ''}`}>
      <button type={type} disabled={disabled} className="block w-full" {...buttonProps}>
        {content}
      </button>
    </div>
  );
}

export { GlowLink } from './button';
