'use client';

import { useMemo, useState } from 'react';
import type { Product, ProductImage } from '@/lib/api';

type GalleryImage = Pick<ProductImage, 'id' | 'image_url' | 'alt_text' | 'sort_order' | 'is_primary'>;

export function getProductImages(product: Product): GalleryImage[] {
  const images = [...(product.images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order || a.id - b.id);
  if (images.length) return images;
  if (product.image_url) return [{ id: 0, image_url: product.image_url, alt_text: `${product.name} - slika proizvoda`, sort_order: 0, is_primary: true }];
  return [];
}

function GalleryPlaceholder({ productName, compact = false }: { productName: string; compact?: boolean }) {
  return <div className={`flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-center font-medium text-slate-500 ${compact ? 'aspect-square rounded-2xl px-2 text-xs' : 'aspect-[4/5] rounded-3xl px-6 text-sm'}`}>Slika za {productName} uskoro</div>;
}

export function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => getProductImages(product), [product]);
  const [activeUrl, setActiveUrl] = useState(images[0]?.image_url ?? null);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const activeImage = images.find((image) => image.image_url === activeUrl) ?? images[0];
  const activeFailed = activeImage ? failedUrls.includes(activeImage.image_url) : false;

  if (!images.length) {
    return <GalleryPlaceholder productName={product.name} />;
  }

  return (
    <section className="grid gap-4" aria-label={`Galerija proizvoda ${product.name}`}>
      {activeFailed ? <GalleryPlaceholder productName={product.name} /> : <img src={activeImage.image_url} alt={activeImage.alt_text ?? `${product.name} - prikaz proizvoda`} onError={() => setFailedUrls((urls) => [...urls, activeImage.image_url])} className="aspect-[4/5] w-full rounded-3xl bg-slate-100 object-cover" />}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => {
          const failed = failedUrls.includes(image.image_url);
          const label = image.alt_text ?? `${product.name} - slika ${index + 1}`;
          return (
            <button key={`${image.id}-${image.image_url}`} type="button" aria-label={`Prikaži ${label}`} onClick={() => setActiveUrl(image.image_url)} className={`rounded-2xl ring-offset-2 ${image.image_url === activeImage.image_url ? 'ring-2 ring-primary' : ''}`}>
              {failed ? <GalleryPlaceholder productName={product.name} compact /> : <img src={image.image_url} alt={label} onError={() => setFailedUrls((urls) => [...urls, image.image_url])} className="aspect-square rounded-2xl bg-slate-100 object-cover" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
