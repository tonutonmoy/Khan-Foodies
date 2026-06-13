'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { GlowButton } from '@/components/glow-button';
import { FreeDeliveryBadge } from '@/components/free-delivery-badge';
import { t } from '@/lib/i18n-bn';

const ACCENTS = ['#1a234d', '#2a3568', '#f5b075', '#e89a52', '#121833'];

interface ProductCardProps {
  product: Product;
  categoryLabel: string;
  index?: number;
  onAddToCart: () => void;
  onImageClick?: () => void;
}

export function ProductCard({
  product,
  categoryLabel,
  index = 0,
  onAddToCart,
  onImageClick,
}: ProductCardProps) {
  const discountedPrice = product.price * (1 - product.discount / 100);
  const isOutOfStock = product.stock <= 0;
  const accent = ACCENTS[index % ACCENTS.length];

  const tags: string[] = [];
  if (product.discount > 0) tags.push(`${t.savePercent} ${product.discount}%`);
  if (product.rating >= 4) tags.push(`${product.rating.toFixed(1)} ★`);
  if (product.freeShipping) tags.push(t.freeDeliveryBadge);

  const priceLabel =
    product.discount > 0 ? (
      <>
        <s>৳{product.price.toLocaleString('bn-BD')}</s>
        ৳{discountedPrice.toLocaleString('bn-BD')}
      </>
    ) : (
      <>৳{product.price.toLocaleString('bn-BD')}</>
    );

  return (
    <section className="pc-card" style={{ '--product-card--accent': accent } as React.CSSProperties}>
      {onImageClick ? (
        <button
          type="button"
          onClick={onImageClick}
          className="pc-thumbnail-stack pc-thumbnail-stack--clickable"
          aria-label={`${product.nameBn || product.name} — ${t.viewDetails}`}
        >
          <Image
            src={product.image}
            alt={product.nameBn || product.name}
            width={240}
            height={240}
            className="pc-thumbnail-img"
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 50vw, 240px"
          />
          {product.freeShipping && (
            <span className="pc-free-delivery">
              <FreeDeliveryBadge />
            </span>
          )}
        </button>
      ) : (
        <div className="pc-thumbnail-stack">
          <Image
            src={product.image}
            alt={product.nameBn || product.name}
            width={240}
            height={240}
            className="pc-thumbnail-img pointer-events-none"
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 50vw, 240px"
          />
          {product.freeShipping && (
            <span className="pc-free-delivery">
              <FreeDeliveryBadge />
            </span>
          )}
        </div>
      )}

      <p className="pc-category">{categoryLabel}</p>

      <h2 className="pc-heading">{product.nameBn || product.name}</h2>

      <p className="pc-price">{priceLabel}</p>

      <p className="pc-description">{product.descriptionBn || product.description}</p>

      {tags.length > 0 && (
        <ul className="pc-tag-list">
          {tags.map((tag) => (
            <li
              key={tag}
              className={`pc-tag${tag === t.freeDeliveryBadge ? ' pc-tag--free' : ''}`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="pc-button-wrap">
        <GlowButton
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className="w-full"
          innerClassName="w-full text-[10px] sm:text-xs py-1.5 px-3"
        >
          {isOutOfStock ? t.outOfStock : t.addToCartFull}
        </GlowButton>
      </div>
    </section>
  );
}
