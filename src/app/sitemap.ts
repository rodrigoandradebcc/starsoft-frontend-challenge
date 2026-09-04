import type { MetadataRoute } from 'next';
import { productsService } from '@/features/products';
import { getSiteUrl } from '@/lib/config/site-url';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
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
