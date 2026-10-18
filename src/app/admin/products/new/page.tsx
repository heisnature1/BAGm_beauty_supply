'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brand, Category } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

function NewProductAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [directions, setDirections] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [suitableSkinTypes, setSuitableSkinTypes] = useState<string[]>(['all']);
  const [relevantConcerns, setRelevantConcerns] = useState<string[]>(['hydration']);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load brands and categories
    Promise.all([
      fetch('/api/brands').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([bData, cData]) => {
        if (bData?.brands) setBrands(bData.brands);
        if (cData?.categories) setCategories(cData.categories);
        if (bData?.brands?.[0]) setBrandId(bData.brands[0].id);
        if (cData?.categories?.[0]) setCategoryId(cData.categories[0].id);
      })
      .finally(() => setLoadingConfig(false));
  }, []);

  // If in edit mode, fetch existing product
  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/products?id=${editId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.product) {
            const p = data.product;
            setName(p.name);
            setSku(p.sku);
            setBrandId(p.brand_id);
            setCategoryId(p.category_id);
            setPrice(p.price.toString());
            setCostPrice(p.cost_price?.toString() || '0');
            setStockQuantity(p.stock_quantity.toString());
            setLowStockThreshold(p.low_stock_threshold.toString());
            setDescription(p.description);
            setIngredients(p.ingredients || '');
            setBenefitsText(Array.isArray(p.benefits) ? p.benefits.join('\n') : '');
            setDirections(p.directions_for_use || '');
            setImageUrl(p.images?.[0] || '');
            setSecondaryImageUrl(p.images?.[1] || '');
            setSuitableSkinTypes(p.suitable_skin_types || ['all']);
            setRelevantConcerns(p.relevant_concerns || []);
            setIsPublished(p.is_published === 1);
            setIsFeatured(p.is_featured === 1);
            setIsBestseller(p.is_bestseller === 1);
            setIsNewArrival(p.is_new_arrival === 1);
          }
        })
        .catch(() => {});
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const benefits = benefitsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const images = [imageUrl, secondaryImageUrl].filter(Boolean);

      const payload = {
        id: editId || undefined,
        name,
        sku,
        brand_id: brandId,
        category_id: categoryId,
        price: parseFloat(price),
        cost_price: parseFloat(costPrice || '0'),
        stock_quantity: parseInt(stockQuantity, 10),
        low_stock_threshold: parseInt(lowStockThreshold, 10),
        description,
        ingredients,
        benefits,
        directions_for_use: directions,
        images,
        suitable_skin_types: suitableSkinTypes,
        relevant_concerns: relevantConcerns,
        is_published: isPublished ? 1 : 0,
        is_featured: isFeatured ? 1 : 0,
        is_bestseller: isBestseller ? 1 : 0,
        is_new_arrival: isNewArrival ? 1 : 0,
      };

      const res = await fetch('/api/admin/products', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/products'), 1000);
      } else {
        setError(data.error || 'Failed to save product record.');
        setSaving(false);
      }
    } catch {
      setError('An error occurred while saving the product.');
      setSaving(false);
    }
  };

  const toggleSkinType = (type: string) => {
    setSuitableSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleConcern = (concern: string) => {
    setRelevantConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">
              {editId ? 'Edit Product Record' : 'Add New Beauty Formulation'}
            </h1>
            <p className="text-xs text-charcoal-400">
              Configure product details, selling price in GH₵, ingredients, and stock.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Product saved successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Info */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <h3 className="font-serif font-bold text-base text-white">1. Basic Product Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. BAGm Silk Barrier Peptide Cream 50ml"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                required
                placeholder="e.g. BAGM-CR-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Brand</label>
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.origin})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <h3 className="font-serif font-bold text-base text-white">2. Pricing &amp; Inventory</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Price (GH₵)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="340.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500 font-serif font-bold"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Cost Price (GH₵)</label>
              <input
                type="number"
                step="0.01"
                placeholder="180.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-charcoal-500">For profit reporting</span>
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Available Stock</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Low Stock Limit</label>
              <input
                type="number"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Media & Images */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <h3 className="font-serif font-bold text-base text-white">3. Product Images (URLs)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Primary Image URL</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Secondary Hover Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={secondaryImageUrl}
                onChange={(e) => setSecondaryImageUrl(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Descriptions, Benefits & Ingredients */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <h3 className="font-serif font-bold text-base text-white">4. Formulation Descriptions &amp; Ingredients</h3>

          <div className="space-y-4">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Product Description</label>
              <textarea
                required
                rows={4}
                placeholder="Detailed description of the beauty product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Key Benefits (One per line)</label>
              <textarea
                rows={3}
                placeholder="Deeply restores compromised lipid skin barriers&#10;Improves elasticity and smooths texture"
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Directions for Use</label>
              <textarea
                rows={2}
                placeholder="Warm a dime-sized amount and gently press into cleansed skin..."
                value={directions}
                onChange={(e) => setDirections(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Full Ingredients List</label>
              <textarea
                rows={3}
                placeholder="Aqua/Water, Glycerin, Ceramide NP, ..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Skin Types & Concerns Tagger for Routine Finder */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <h3 className="font-serif font-bold text-base text-white">5. Routine Finder Attribute Matching</h3>

          <div>
            <label className="font-bold uppercase text-charcoal-400 block mb-2">Suitable Skin Types</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'oily', 'dry', 'combination', 'normal', 'sensitive'].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => toggleSkinType(st)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold capitalize transition-colors ${
                    suitableSkinTypes.includes(st)
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-charcoal-900 border-charcoal-700 text-charcoal-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold uppercase text-charcoal-400 block mb-2">Relevant Skin Concerns</label>
            <div className="flex flex-wrap gap-2">
              {['dryness', 'uneven_tone', 'excess_oil', 'blemishes', 'hydration', 'pores', 'aging'].map((sc) => (
                <button
                  type="button"
                  key={sc}
                  onClick={() => toggleConcern(sc)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold capitalize transition-colors ${
                    relevantConcerns.includes(sc)
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-charcoal-900 border-charcoal-700 text-charcoal-400 hover:text-white'
                  }`}
                >
                  {sc.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Toggles */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-3">
          <h3 className="font-serif font-bold text-base text-white mb-2">6. Publication Flags</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-white">Published</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-white">Featured Product</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-white">Bestseller</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-white">New Arrival</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 rounded-xl border border-charcoal-700 text-charcoal-300 hover:bg-charcoal-800 font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Product...' : 'Save Product Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProductAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-500">Loading form...</div>}>
      <NewProductAdminContent />
    </Suspense>
  );
}
