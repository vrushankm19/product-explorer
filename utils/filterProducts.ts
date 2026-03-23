import type { Product, SortOption } from "@/lib/types/product";

const FAKESTORE_CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
] as const;

export type SmartConstraints = {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
};

/**
 * Parses natural-style filter strings (price hints, category hints).
 * Examples: "cheap products", "under 50", "electronics only", "jewelery under 200"
 */
export function parseSmartFilter(raw: string): SmartConstraints {
  const q = raw.trim().toLowerCase();
  const out: SmartConstraints = {};

  if (!q) return out;

  const under = q.match(
    /(?:under|below|less than|<)\s*\$?(\d+(?:\.\d+)?)/i,
  );
  if (under) out.maxPrice = Number(under[1]);

  const over = q.match(
    /(?:over|above|more than|>)\s*\$?(\d+(?:\.\d+)?)/i,
  );
  if (over) out.minPrice = Number(over[1]);

  if (/\b(cheap|affordable|budget)\b/i.test(q)) {
    const cap = 50;
    out.maxPrice = out.maxPrice !== undefined ? Math.min(out.maxPrice, cap) : cap;
  }

  if (q.includes("women")) {
    out.category = "women's clothing";
  } else if (/\bmen\b|men's|mens/.test(q)) {
    out.category = "men's clothing";
  } else if (q.includes("electronics")) {
    out.category = "electronics";
  } else if (q.includes("jewelery") || q.includes("jewelry")) {
    out.category = "jewelery";
  } else {
    for (const c of FAKESTORE_CATEGORIES) {
      if (q.includes(c)) {
        out.category = c;
        break;
      }
    }
  }

  return out;
}

export function filterBySearch(products: Product[], term: string): Product[] {
  const t = term.trim().toLowerCase();
  if (!t) return products;
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(t) ||
      p.category.toLowerCase().includes(t),
  );
}

export function filterBySmartConstraints(
  products: Product[],
  constraints: SmartConstraints,
): Product[] {
  if (
    constraints.maxPrice === undefined &&
    constraints.minPrice === undefined &&
    constraints.category === undefined
  ) {
    return products;
  }

  return products.filter((p) => {
    if (constraints.maxPrice !== undefined && p.price > constraints.maxPrice) {
      return false;
    }
    if (constraints.minPrice !== undefined && p.price < constraints.minPrice) {
      return false;
    }
    if (constraints.category !== undefined) {
      return p.category.toLowerCase() === constraints.category.toLowerCase();
    }
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      copy.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      copy.sort((a, b) => b.price - a.price);
      break;
    case "title-asc":
      copy.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
      break;
    default:
      break;
  }
  return copy;
}

export function pipelineProducts(
  products: Product[],
  search: string,
  smartQuery: string,
  sort: SortOption,
): Product[] {
  const smart = parseSmartFilter(smartQuery);
  let list = filterBySearch(products, search);
  list = filterBySmartConstraints(list, smart);
  return sortProducts(list, sort);
}
