import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductDetails from '@/components/product/ProductDetails/ProductDetails';
import { productsService } from '@/lib/api/products.service';

export const revalidate = 300;
export const dynamicParams = false;

const getProduct = cache(productsService.getById);
type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  try {
    const ids = await productsService.listAllIds();
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return product
    ? {
        title: product.name,
        description: product.description,
        alternates: { canonical: `/products/${product.id}` },
        openGraph: { images: [product.image] },
      }
    : { title: 'Produto não encontrado', robots: { index: false } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).id);
  if (!product) notFound();
  return <ProductDetails product={product} />;
}
