'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { formatDateOnly } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { Star, ShieldCheck, MessageSquarePlus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

interface ProductReviewsSectionProps {
  product: Product;
  initialReviews: any[];
}

export function ProductReviewsSection({ product, initialReviews }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [skinType, setSkinType] = useState('combination');
  const [skinConcern, setSkinConcern] = useState('hydration');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating,
          title,
          comment,
          skinType,
          skinConcern,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSuccess(true);
        if (data.review) {
          setReviews([data.review, ...reviews]);
        }
        setTimeout(() => {
          setModalOpen(false);
          setFormSuccess(false);
          setTitle('');
          setComment('');
        }, 2000);
      } else {
        setFormError(data.error || 'Failed to submit review. Verified purchase check failed.');
      }
    } catch {
      setFormError('An error occurred submitting your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card space-y-8">
      {/* Header & Score Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700 tracking-widest uppercase">Verified Feedback</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Purchases Verified</span>
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900 mt-1">
            Customer Reviews ({reviews.length})
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-3xl text-charcoal-900">{averageRating}</span>
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-charcoal-400">
                Based on {reviews.length} genuine {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-50 mx-auto flex items-center justify-center text-brand-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-semibold text-lg text-charcoal-800">No Verified Reviews Yet</h3>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
            BAGm Beauty Supply only displays genuine reviews from verified Ghanaian customers who purchased this item.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl bg-blush-light border border-brand-100/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {rev.title && <h4 className="font-semibold text-sm text-charcoal-900">{rev.title}</h4>}
                </div>
                <span className="text-xs text-charcoal-400">{formatDateOnly(rev.created_at)}</span>
              </div>

              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">{rev.comment}</p>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-100/60 text-[11px] text-charcoal-500">
                <span className="font-semibold text-charcoal-800">
                  {rev.first_name} {rev.last_name ? rev.last_name[0] + '.' : ''}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Purchase</span>
                </span>
                {rev.skin_type && (
                  <>
                    <span>•</span>
                    <span className="bg-white px-2 py-0.5 rounded text-charcoal-600 border border-brand-100 capitalize">
                      {rev.skin_type} Skin
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write a Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-brand-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Write a Verified Review</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Sharing your experience with <strong>{product.name}</strong> helps other customers build their ideal routine.
              </p>
            </div>

            {!user ? (
              <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 text-center space-y-3">
                <p className="text-xs sm:text-sm text-charcoal-700">
                  Please sign in to your BAGm customer account to submit a verified purchase review.
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    href={`/account/login?redirect=/product/${product.slug}`}
                    className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            ) : formSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-900">Thank You!</h4>
                <p className="text-xs text-emerald-700">Your verified review has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Rating Stars */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Your Overall Rating:
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform text-amber-400"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Review Headline:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incredibly hydrating & non-greasy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                    Your Review &amp; Experience:
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the texture, finish, scent, and how it felt on your skin..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Skin Profile Tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-charcoal-600 block mb-1">
                      Your Skin Type:
                    </label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="combination">Combination</option>
                      <option value="oily">Oily</option>
                      <option value="dry">Dry</option>
                      <option value="normal">Normal</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-charcoal-600 block mb-1">
                      Target Concern:
                    </label>
                    <select
                      value={skinConcern}
                      onChange={(e) => setSkinConcern(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="hydration">Dryness & Hydration</option>
                      <option value="uneven_tone">Uneven Tone</option>
                      <option value="blemishes">Blemishes & Breakouts</option>
                      <option value="excess_oil">Excess Oil</option>
                      <option value="aging">Fine Lines</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors shadow-md"
                  >
                    {submitting ? 'Verifying Purchase & Submitting...' : 'Submit Verified Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
