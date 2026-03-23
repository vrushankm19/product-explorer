import Image from "next/image";
import type { Product } from "@/lib/types/product";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {product.title}
        </h2>
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
          ${product.price.toFixed(2)}
        </p>
        <p className="mt-auto text-xs capitalize text-zinc-500 dark:text-zinc-400">
          {product.category}
        </p>
      </div>
    </article>
  );
}
