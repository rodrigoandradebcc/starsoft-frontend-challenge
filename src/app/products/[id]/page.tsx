import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductDetails from '@/components/product/ProductDetails/ProductDetails';
import { productsService } from '@/lib/api/products.service';

export const dynamic = 'force-dynamic';
const getProduct = cache(productsService.getById);
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return product
    ? {
        title: product.name,
        description: product.description,
        openGraph: { images: [product.image] },
      }
    : { title: 'Produto não encontrado' };
}
export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
