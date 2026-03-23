"use client";

import type { SortOption } from "@/lib/types/product";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "title-asc", label: "Title: A → Z" },
];

type Props = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export function SortDropdown({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
      <label
        htmlFor="sort-by"
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Sort by
      </label>
      <select
        id="sort-by"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="min-w-[200px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
