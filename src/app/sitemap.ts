import type { MetadataRoute } from 'next';
import { productsService } from '@/lib/api/products.service';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const home: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'daily', priority: 1 }];
  try {
    const products = await productsService.listAll();
    return [
      ...home,
      ...products.map((product) => ({
        url: `${base}/products/${product.id}`,
        lastModified: new Date(product.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return home;
  }
}
