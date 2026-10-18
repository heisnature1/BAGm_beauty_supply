import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { parseProductRow } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    const { skinType, skinConcern, routineDepth, ingredientPreference } = await req.json();

    const db = getDb();

    // Query published products with joined brand and category
    const rows = db.prepare(`
      SELECT p.*,
             b.name as brand_name, b.slug as brand_slug, b.origin as brand_origin,
             c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN brands b ON p.brand_id = b.id
      WHERE p.is_published = 1 AND p.stock_quantity > 0
    `).all() as any[];

    const allProducts = rows.map(parseProductRow);

    // Filter and score products for each step
    const scoreProduct = (product: any, targetCategorySlug: string | string[]) => {
      let score = 0;
      const categories = Array.isArray(targetCategorySlug) ? targetCategorySlug : [targetCategorySlug];
      if (categories.includes(product.category_slug)) {
        score += 50;
      } else {
        return -1; // Must belong to appropriate category
      }

      // Skin type match
      if (product.suitable_skin_types.includes(skinType) || product.suitable_skin_types.includes('all')) {
        score += 25;
      }

      // Skin concern match
      if (product.relevant_concerns.includes(skinConcern)) {
        score += 25;
      }

      // Ingredient preference bonus
      if (ingredientPreference === 'botanical' && (product.brand_origin === 'Ghanaian' || product.brand_origin === 'BAGm')) {
        score += 15;
      } else if (ingredientPreference === 'niacinamide' && (product.ingredients?.toLowerCase().includes('niacinamide'))) {
        score += 15;
      } else if (ingredientPreference === 'ceramides' && (product.ingredients?.toLowerCase().includes('ceramide') || product.ingredients?.toLowerCase().includes('peptide'))) {
        score += 15;
      }

      return score;
    };

    const getBestProduct = (categories: string[]) => {
      const candidates = allProducts
        .map((p) => ({ product: p, score: scoreProduct(p, categories) }))
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score);

      return candidates[0]?.product || null;
    };

    const routine: Array<{
      stepNumber: number;
      stepName: string;
      category: string;
      product: any;
      matchReason: string;
    }> = [];

    // Step 1: Cleanser
    const cleanser = getBestProduct(['facial-care', 'skincare']);
    if (cleanser) {
      routine.push({
        stepNumber: 1,
        stepName: 'Gentle Cleanser',
        category: 'Cleansing',
        product: cleanser,
        matchReason: `Formulated specifically for ${skinType} skin to remove impurities without stripping natural lipids.`,
      });
    }

    if (routineDepth === 'complete') {
      // Step 2: Essence / Toner
      const essence = getBestProduct(['facial-care', 'skincare']);
      if (essence && essence.id !== cleanser?.id) {
        routine.push({
          stepNumber: 2,
          stepName: 'Hydrating Botanical Essence',
          category: 'Prep & Hydrate',
          product: essence,
          matchReason: 'Preps your skin mantle and enhances cellular absorption of active treatments.',
        });
      }
    }

    // Step 3: Targeted Serum
    const serum = getBestProduct(['serums-and-treatments', 'facial-care']);
    if (serum && !routine.some((r) => r.product.id === serum.id)) {
      routine.push({
        stepNumber: routine.length + 1,
        stepName: 'Targeted Treatment Serum',
        category: 'Treat',
        product: serum,
        matchReason: `Directly targets ${skinConcern.replace('_', ' ')} with concentrated high-potency actives.`,
      });
    }

    // Step 4: Moisturizer / Barrier Cream
    const moisturizer = getBestProduct(['skincare', 'facial-care', 'body-care']);
    if (moisturizer && !routine.some((r) => r.product.id === moisturizer.id)) {
      routine.push({
        stepNumber: routine.length + 1,
        stepName: 'Barrier Restorative Cream',
        category: 'Moisturize',
        product: moisturizer,
        matchReason: 'Locks in active serums while sealing hydration with lightweight, climate-friendly emollients.',
      });
    }

    // Step 5: Sun Protection SPF
    const spf = getBestProduct(['sun-protection']);
    if (spf && !routine.some((r) => r.product.id === spf.id)) {
      routine.push({
        stepNumber: routine.length + 1,
        stepName: 'Invisible Broad Spectrum SPF',
        category: 'Protect',
        product: spf,
        matchReason: 'Essential daily defense against UVA/UVB rays with 100% transparent finish on melanin-rich skin.',
      });
    }

    return NextResponse.json({ success: true, routine });
  } catch (error: any) {
    console.error('Routine finder API error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to generate routine' }, { status: 500 });
  }
}
