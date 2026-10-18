'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('sort', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      defaultValue={currentSort}
      onChange={handleSortChange}
      className="text-xs font-semibold text-charcoal-800 bg-white border border-brand-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-500 shadow-xs cursor-pointer"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="popular">Most Popular</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Highest Customer Rating</option>
      <option value="name_asc">Name: A to Z</option>
    </select>
  );
}
