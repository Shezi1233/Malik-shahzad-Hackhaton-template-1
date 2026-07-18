import type { Metadata } from "next";
import ProductDetailClient from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ProductPageProps {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found — SHOP.CO",
      description: "The product you're looking for doesn't exist or has been removed.",
    };
  }

  return {
    title: `${product.title} — SHOP.CO`,
    description: product.description?.slice(0, 160) || `Shop ${product.title} at SHOP.CO. Premium quality clothing and accessories.`,
    openGraph: {
      title: `${product.title} — SHOP.CO`,
      description: product.description?.slice(0, 160) || `Shop ${product.title} at SHOP.CO.`,
      images: product.img_url ? [{ url: product.img_url }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — SHOP.CO`,
      description: product.description?.slice(0, 160) || `Shop ${product.title} at SHOP.CO.`,
      images: product.img_url ? [product.img_url] : [],
    },
    keywords: [`${product.title}`, "clothing", "fashion", "shop.co", "premium wear"],
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetailClient productId={Number(params.id)} />;
}
