'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Product } from '@/types';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  ShoppingBag,
  ShieldAlert,
  Star,
  Check,
} from 'lucide-react';

interface RoutineStep {
  stepNumber: number;
  stepName: string;
  category: string;
  product: Product;
  matchReason: string;
}

export default function RoutineFinderPage() {
  const { addItem } = useCart();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [skinType, setSkinType] = useState<string>('');
  const [skinConcern, setSkinConcern] = useState<string>('');
  const [routineDepth, setRoutineDepth] = useState<string>('essential'); // 'essential' | 'complete'
  const [ingredientPreference, setIngredientPreference] = useState<string>('any');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RoutineStep[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  const totalQuestions = 4;

  const handleNext = async () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Calculate recommendations
      setLoading(true);
      try {
        const res = await fetch('/api/routine-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skinType,
            skinConcern,
            routineDepth,
            ingredientPreference,
          }),
        });
        const data = await res.json();
        if (res.ok && data.routine) {
          setRecommendations(data.routine);
          setHasCompleted(true);
        }
      } catch (err) {
        console.error('Routine calculation failed', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestion(1);
    setSkinType('');
    setSkinConcern('');
    setRoutineDepth('essential');
    setIngredientPreference('any');
    setRecommendations([]);
    setHasCompleted(false);
    setAddedAll(false);
  };

  const handleAddAllToCart = () => {
    recommendations.forEach((step) => {
      addItem({
        productId: step.product.id,
        name: step.product.name,
        sku: step.product.sku,
        price: step.product.price,
        quantity: 1,
        image: step.product.images?.[0] || '',
        maxStock: step.product.stock_quantity,
        brandName: step.product.brand_name,
      });
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  const totalRoutinePrice = recommendations.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Smart Skincare Routine Finder</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Personalized Skincare Consultation
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
              Answer 4 simple questions to receive a custom routine matched to your unique skin profile and Ghana’s climate.
            </p>
          </div>

          {!hasCompleted ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-luxury">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-400 mb-2">
                  <span>Question {currentQuestion} of {totalQuestions}</span>
                  <span>{Math.round((currentQuestion / totalQuestions) * 100)}% Completed</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question 1: Skin Type */}
              {currentQuestion === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-charcoal-900">
                      1. How would you describe your skin type?
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                      Think about how your skin feels a few hours after washing without heavy creams.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { id: 'oily', title: 'Oily Skin', desc: 'Prone to excess shine all over, visible pores, and midday slick.' },
                      { id: 'dry', title: 'Dry Skin', desc: 'Feels tight, rough, prone to flaking or ashy texture in air conditioning.' },
                      { id: 'combination', title: 'Combination Skin', desc: 'Oily T-zone (forehead, nose, chin) with normal or dry cheeks.' },
                      { id: 'normal', title: 'Normal Skin', desc: 'Comfortably balanced, rarely overly oily or uncomfortably dry.' },
                      { id: 'sensitive', title: 'Sensitive Skin', desc: 'Easily turns red, stings, or reacts to harsh fragrances and chemicals.' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSkinType(opt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          skinType === opt.id
                            ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                            : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-charcoal-900">{opt.title}</h4>
                          {skinType === opt.id && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                        </div>
                        <p className="text-xs text-charcoal-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 2: Primary Skin Concern */}
              {currentQuestion === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-charcoal-900">
                      2. What is your primary skincare goal or concern?
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                      Choose the main improvement you want to see in your skin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { id: 'uneven_tone', title: 'Uneven Tone & Dark Spots', desc: 'Post-acne hyperpigmentation, sun discoloration, or dullness.' },
                      { id: 'dryness', title: 'Dryness & Dehydration', desc: 'Craving deep, lasting moisture, barrier relief, and suppleness.' },
                      { id: 'blemishes', title: 'Blemishes & Breakouts', desc: 'Tackling active spots, blackheads, and clarifying congested skin.' },
                      { id: 'excess_oil', title: 'Excess Oil & Shine Control', desc: 'Balancing sebum production and minimizing enlarged pores.' },
                      { id: 'hydration', title: 'Skin Barrier Repair & Glow', desc: 'Strengthening delicate skin barriers and achieving healthy glass skin.' },
                      { id: 'aging', title: 'Fine Lines & Firmness', desc: 'Promoting collagen resilience and youthful elasticity.' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSkinConcern(opt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          skinConcern === opt.id
                            ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                            : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-charcoal-900">{opt.title}</h4>
                          {skinConcern === opt.id && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                        </div>
                        <p className="text-xs text-charcoal-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 3: Routine Depth */}
              {currentQuestion === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-charcoal-900">
                      3. What type of routine matches your lifestyle?
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                      Whether you prefer quick essentials or a comprehensive multi-step ritual.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setRoutineDepth('essential')}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        routineDepth === 'essential'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-base text-charcoal-900">Essential 3-Step Routine</h4>
                        {routineDepth === 'essential' && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                      </div>
                      <p className="text-xs text-charcoal-600 mt-1.5 leading-relaxed">
                        Cleanse &rarr; Moisturize / Treat &rarr; Invisible SPF. Quick, effective, and takes under 3 minutes.
                      </p>
                    </button>

                    <button
                      onClick={() => setRoutineDepth('complete')}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        routineDepth === 'complete'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-base text-charcoal-900">Complete 5-Step Glow Ritual</h4>
                        {routineDepth === 'complete' && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                      </div>
                      <p className="text-xs text-charcoal-600 mt-1.5 leading-relaxed">
                        Cleanse &rarr; Botanical Essence &rarr; Active Serum &rarr; Barrier Cream &rarr; SPF. Maximum results and radiant glow.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Question 4: Ingredient Preference */}
              {currentQuestion === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-charcoal-900">
                      4. Any ingredient preferences or focuses?
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                      Choose which active ingredient profile you want highlighted.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { id: 'any', title: 'Balanced Blend', desc: 'A synergy of clinically-proven actives and soothing botanicals.' },
                      { id: 'botanical', title: 'Ghanaian Botanicals & Shea', desc: 'Focus on cold-pressed baobab oil, raw shea butter, and natural extracts.' },
                      { id: 'niacinamide', title: 'Niacinamide & Zinc Focus', desc: 'Targeting pore refinement, sebum regulation, and brightening.' },
                      { id: 'ceramides', title: 'Ceramides & Peptides', desc: 'Restoring skin barrier integrity and deep cellular hydration.' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setIngredientPreference(opt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          ingredientPreference === opt.id
                            ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                            : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-charcoal-900">{opt.title}</h4>
                          {ingredientPreference === opt.id && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                        </div>
                        <p className="text-xs text-charcoal-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
                {currentQuestion > 1 ? (
                  <button
                    onClick={() => setCurrentQuestion((prev) => prev - 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Question</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNext}
                  disabled={
                    (currentQuestion === 1 && !skinType) ||
                    (currentQuestion === 2 && !skinConcern) ||
                    loading
                  }
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold text-sm transition-all shadow-md active:scale-98"
                >
                  {loading ? (
                    <span>Formulating Your Routine...</span>
                  ) : currentQuestion === totalQuestions ? (
                    <>
                      <span>Generate My Custom Routine</span>
                      <Sparkles className="w-4 h-4 text-gold-300" />
                    </>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results Presentation */
            <div className="space-y-8 animate-fade-in">
              {/* Summary Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Custom Routine Curated for You</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                    Your {skinType.toUpperCase()} &amp; {skinConcern.replace('_', ' ').toUpperCase()} Regimen
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                    {recommendations.length} formulated steps designed for daily synergy in Ghana&apos;s climate.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-charcoal-700 hover:bg-gray-50 text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    onClick={handleAddAllToCart}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md transition-all ${
                      addedAll ? 'bg-emerald-600' : 'bg-brand-600 hover:bg-brand-700 active:scale-98'
                    }`}
                  >
                    {addedAll ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>All Steps Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add Full Routine ({formatGHS(totalRoutinePrice)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-4">
                {recommendations.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-brand-100 shadow-card flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex gap-4 items-start sm:items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 font-serif font-bold text-base flex items-center justify-center shrink-0 border border-brand-200">
                        {step.stepNumber}
                      </div>

                      <img
                        src={step.product.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200'}
                        alt={step.product.name}
                        className="w-20 h-20 rounded-xl object-cover border border-gray-100 shrink-0"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {step.stepName}
                          </span>
                          <span className="text-xs text-charcoal-400 font-medium">• {step.product.brand_name}</span>
                        </div>

                        <Link
                          href={`/product/${step.product.slug}`}
                          className="font-serif font-bold text-sm sm:text-base text-charcoal-900 hover:text-brand-700 transition-colors block mt-1"
                        >
                          {step.product.name}
                        </Link>

                        <p className="text-xs text-charcoal-500 mt-1 max-w-md leading-relaxed">
                          <strong className="text-charcoal-700">Why recommended:</strong> {step.matchReason}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 shrink-0">
                      <span className="font-serif font-bold text-base text-charcoal-900">
                        {formatGHS(step.product.price)}
                      </span>
                      <button
                        onClick={() =>
                          addItem({
                            productId: step.product.id,
                            name: step.product.name,
                            sku: step.product.sku,
                            price: step.product.price,
                            quantity: 1,
                            image: step.product.images?.[0] || '',
                            maxStock: step.product.stock_quantity,
                            brandName: step.product.brand_name,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-semibold transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Step</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Beauty Consultation Note:</strong> This routine finder provides general cosmetic skincare guidance based on product ingredient profiles and does not constitute medical diagnosis or treatment for clinical skin conditions. Always patch test new formulas.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
