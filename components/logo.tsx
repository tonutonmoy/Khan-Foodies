import Image from 'next/image';

type LogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

export function Logo({ className = '', height = 44, priority = false }: LogoProps) {
  return (
    <Image
      src="/khan-foodies-logo.png"
      alt="Khan Foodies"
      width={Math.round(height * 2.8)}
      height={height}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ height, width: 'auto', maxHeight: height }}
      priority={priority}
    />
  );
}
