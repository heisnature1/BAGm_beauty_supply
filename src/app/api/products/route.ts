import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const brandSlug = searchParams.get('brand') || undefined;
    const brandOrigin = searchParams.get('origin') || undefined;
    const skinType = searchParams.get('skin_type') || undefined;
    const concern = searchParams.get('concern') || undefined;
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const inStockOnly = searchParams.get('in_stock') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const isBestseller = searchParams.get('bestseller') === 'true';
    const isNewArrival = searchParams.get('new') === 'true';
    const sort = (searchParams.get('sort') as any) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const { products, total } = getProducts({
      search,
      categorySlug,
      brandSlug,
      brandOrigin,
      skinType,
      concern,
      minPrice,
      maxPrice,
      inStockOnly,
      isFeatured,
      isBestseller,
      isNewArrival,
      sort,
      limit,
      offset,
    });

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ products: [], total: 0, error: 'Failed to fetch products' }, { status: 500 });
  }
}
