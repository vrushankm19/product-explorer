"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { Product, SortOption } from "@/lib/types/product";
import { pipelineProducts } from "@/utils/filterProducts";
import { ProductCard } from "./ProductCard";
import { SearchBar } from "./SearchBar";
import { SortDropdown } from "./SortDropdown";

type Props = {
  products: Product[];
};

export function ProductExplorer({ products }: Props) {
  const [search, setSearch] = useState("");
  const [smartFilter, setSmartFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("price-asc");

  const deferredSearch = useDeferredValue(search);

  const visible = useMemo(
    () =>
      pipelineProducts(products, deferredSearch, smartFilter, sort),
    [products, deferredSearch, smartFilter, sort],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Product Explorer
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Search and filter products from the Fake Store catalog.
        </p>
      </header>

      <section
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-6"
        aria-label="Filters and sort"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SearchBar
            id="search-products"
            label="Search products"
            value={search}
            onChange={setSearch}
            placeholder="Filter by title or category…"
          />
          <SearchBar
            id="smart-filter"
            label="Smart filter"
            value={smartFilter}
            onChange={setSmartFilter}
            placeholder='e.g. cheap products, under 50, electronics only'
          />
        </div>
        <SortDropdown value={sort} onChange={setSort} />
      </section>

      <p className="text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
        Showing {visible.length} of {products.length} products
        {search !== deferredSearch ? " (updating…)" : ""}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No products match your filters. Try adjusting search or smart filter.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
