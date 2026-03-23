import type { Metadata } from "next";
import Link from "next/link";
import { ProductExplorer } from "@/components/ProductExplorer";
import type { Product } from "@/lib/types/product";

export const metadata: Metadata = {
  title: "Products | Product Explorer",
  description: "Browse, search, filter, and sort products from Fake Store API.",
};

const API = "https://fakestoreapi.com/products";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(API, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error("Failed to load products");
  }
  return res.json() as Promise<Product[]>;
}

export default async function ProductsPage() {
  let products: Product[];
  try {
    products = await getProducts();
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-zinc-700 dark:text-zinc-300">
          Could not load products. Please try again later.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <nav className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          ← Home
        </Link>
      </nav>
      <ProductExplorer products={products} />
    </>
  );
}
