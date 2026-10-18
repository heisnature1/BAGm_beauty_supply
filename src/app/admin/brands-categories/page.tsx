'use client';

import React, { useState, useEffect } from 'react';
import { Brand, Category } from '@/types';
import { Tags, Plus, Edit, Trash2, X, Sparkles, Building } from 'lucide-react';

export default function BrandsCategoriesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Brand modal
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandOrigin, setBrandOrigin] = useState<'Ghanaian' | 'International' | 'BAGm'>('Ghanaian');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandSite, setBrandSite] = useState('');

  // Category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch('/api/brands').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      if (bRes?.brands) setBrands(bRes.brands);
      if (cRes?.categories) setCategories(cRes.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/brands-categories?type=brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandName,
          origin: brandOrigin,
          description: brandDesc,
          logo_url: brandLogo,
          website_url: brandSite,
        }),
      });
      if (res.ok) {
        setBrandModalOpen(false);
        setBrandName('');
        setBrandDesc('');
        loadData();
      }
    } catch {}
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/brands-categories?type=category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName,
          description: catDesc,
          image_url: catImage,
        }),
      });
      if (res.ok) {
        setCatModalOpen(false);
        setCatName('');
        setCatDesc('');
        loadData();
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif font-bold text-2xl text-white">Brands &amp; Categories Management</h1>
        <p className="text-xs text-charcoal-400 mt-1">
          Manage product categories, brand affiliations, and country of origin labels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Categories Section */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif font-bold text-lg text-white">Categories ({categories.length})</h2>
            <button
              onClick={() => setCatModalOpen(true)}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="divide-y divide-charcoal-800">
            {categories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{c.name}</h4>
                  <p className="text-charcoal-400 line-clamp-1">{c.description || 'No description'}</p>
                </div>
                <span className="text-[11px] font-mono text-charcoal-500">{c.slug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h2 className="font-serif font-bold text-lg text-white">Brands ({brands.length})</h2>
            <button
              onClick={() => setBrandModalOpen(true)}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand</span>
            </button>
          </div>

          <div className="divide-y divide-charcoal-800">
            {brands.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{b.name}</h4>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-charcoal-900 border border-charcoal-700 text-gold-400">
                      {b.origin}
                    </span>
                  </div>
                  <p className="text-charcoal-400 line-clamp-1">{b.description}</p>
                </div>
                <span className="text-[11px] font-mono text-charcoal-500">{b.slug}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">Add Product Category</h3>
              <button onClick={() => setCatModalOpen(false)} className="text-charcoal-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleansers &amp; Toners"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-700 text-charcoal-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">Add Beauty Brand</h3>
              <button onClick={() => setBrandModalOpen(false)} className="text-charcoal-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skin Gourmet"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Brand Heritage Origin</label>
                <select
                  value={brandOrigin}
                  onChange={(e) => setBrandOrigin(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                >
                  <option value="Ghanaian">Ghanaian Brand 🇬🇭</option>
                  <option value="BAGm">BAGm Signature Line ✨</option>
                  <option value="International">International Brand 🌍</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Brand Story &amp; Description</label>
                <textarea
                  rows={3}
                  placeholder="Story and heritage..."
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={brandSite}
                  onChange={(e) => setBrandSite(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-700 text-charcoal-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
