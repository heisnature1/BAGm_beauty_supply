import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/products';

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ categories: [] });
  }
}
