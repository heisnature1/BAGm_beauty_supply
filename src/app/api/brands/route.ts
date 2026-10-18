import { NextResponse } from 'next/server';
import { getBrands } from '@/lib/products';

export async function GET() {
  try {
    const brands = getBrands();
    return NextResponse.json({ brands });
  } catch (error) {
    return NextResponse.json({ brands: [] });
  }
}
