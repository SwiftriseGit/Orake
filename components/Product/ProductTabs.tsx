"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { headingFont, bodyFont } from "@/lib/fonts";
import ReviewModal from "./ReviewModal";
import { PopulatedReview } from "@/lib/data/review";
import { StarRating } from "./StarRating";

function NutritionFactsSection({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? "pt-6 border-t border-gray-100" : ""} max-w-xl`}>
      <h3 className={`${headingFont.className} text-xl sm:text-2xl text-[#15161b] uppercase tracking-wide mb-4`}>
        Nutrition Facts
      </h3>

      <div className={`${bodyFont.className} divide-y divide-gray-200/70 border-t border-b border-gray-200/70 text-sm sm:text-[15px]`}>
        <div className="py-3 flex items-baseline justify-between gap-4">
          <span className="font-semibold text-[#15161b]">Prebiotic Fiber</span>
          <span className="text-[#c25b5e] font-bold">6g</span>
        </div>
        <div className="py-3 flex items-baseline justify-between gap-4">
          <span className="font-semibold text-[#15161b]">Calories</span>
          <span className="text-gray-500 font-medium">Zero</span>
        </div>
        <div className="py-3 flex items-baseline justify-between gap-4">
          <span className="font-semibold text-[#15161b]">Added Sugar</span>
          <span className="text-gray-500 font-medium">No Added Sugar</span>
        </div>
        <div className="py-3 flex items-baseline justify-between gap-4">
          <span className="font-semibold text-[#15161b]">Flavors</span>
          <span className="text-gray-500 font-medium">Natural Flavors</span>
        </div>
        <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
          <span className="font-semibold text-[#15161b]">With Vitamins</span>
          <span className="text-gray-500 font-medium">Vitamin B2, Vitamin B6, Vitamin B12</span>
        </div>
        <div className="py-3 flex items-baseline justify-between gap-4">
          <span className="font-semibold text-[#15161b]">Source</span>
          <span className="text-gray-500 font-medium">100% Plant Based · Vegan</span>
        </div>
      </div>
    </div>
  );
}

interface ProductTabsProps {
  product: {
    _id: string;
    slug: string;
    name: string;
    description: string;
    numReviews: number;
  };
  reviews: PopulatedReview[];
}

export default function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use actual reviews from props
  const displayReviews = reviews;

  // Calculate average rating
  const totalRating = displayReviews.reduce((sum, rev) => sum + rev.rating, 0);
  const avgRating = displayReviews.length > 0 ? (totalRating / displayReviews.length).toFixed(1) : "0.0";
  const numReviews = displayReviews.length;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-24 relative mt-10">
      <div className="flex items-center gap-6 sm:gap-8 border-b border-gray-100 mb-10 overflow-x-auto overflow-y-hidden md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveTab("description")}
          className={`${headingFont.className} text-xl sm:text-2xl uppercase tracking-wider pb-4 transition-colors relative whitespace-nowrap ${activeTab === "description" ? "text-[#15161b]" : "text-gray-400 hover:text-[#15161b]"}`}
        >
          Description
          {activeTab === "description" && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#c25b5e]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("nutrition")}
          className={`${headingFont.className} text-xl sm:text-2xl uppercase tracking-wider pb-4 transition-colors relative whitespace-nowrap ${activeTab === "nutrition" ? "text-[#15161b]" : "text-gray-400 hover:text-[#15161b]"}`}
        >
          Nutrition Facts
          {activeTab === "nutrition" && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#c25b5e]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`${headingFont.className} text-xl sm:text-2xl uppercase tracking-wider pb-4 transition-colors relative whitespace-nowrap ${activeTab === "reviews" ? "text-[#15161b]" : "text-gray-400 hover:text-[#15161b]"}`}
        >
          Customer Reviews
          {activeTab === "reviews" && (
            <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#c25b5e]" />
          )}
        </button>
      </div>

      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${bodyFont.className} text-gray-500 leading-relaxed max-w-4xl text-[15px] sm:text-base space-y-6`}
            >
              <p>{product.description}</p>
              <p>How does it taste then? Delightfully tasty! Sweetened with real fruit extracts only, it&apos;s a supercool and healthier alternative to regular sodas. You can enjoy it anytime, whether you&apos;re watching a movie, partying, or simply hanging out with friends.</p>
              <p>So, if you want to savor the classic taste sans the sugar, make a smart choice today. Order Orake {product.name} to enjoy all the fizz and flavor, and say goodbye to all the guilt.</p>

              <NutritionFactsSection compact />
            </motion.div>
          )}

          {activeTab === "nutrition" && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${bodyFont.className} text-gray-500 leading-relaxed max-w-4xl text-[15px] sm:text-base space-y-6`}
            >
              <NutritionFactsSection />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20"
            >
              {/* Summary */}
              <div className="col-span-1">
                <div className="flex items-center gap-4 mb-2">
                  <StarRating rating={Number(avgRating)} className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className={`${headingFont.className} text-4xl sm:text-5xl text-[#15161b] leading-none`}>{avgRating}</span>
                </div>
                <p className={`${bodyFont.className} text-xs text-gray-400 mb-8 uppercase tracking-[0.2em] font-bold`}>Based on {numReviews} reviews</p>

                <div className="space-y-3 mb-10">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = displayReviews.filter(r => r.rating === star).length;
                    const percent = displayReviews.length > 0 ? (count / displayReviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex text-[#dbba53] gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${i < star ? "text-[#dbba53]" : "text-gray-200"}`}>
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                          ))}
                        </div>
                        <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-[#15161b] transition-all duration-500`} style={{ width: `${percent}%` }} />
                        </div>
                        <span className={`${bodyFont.className} text-xs text-gray-400 font-bold w-4 text-right`}>{count}</span>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`${bodyFont.className} flex items-center justify-center gap-3 w-full h-[60px] bg-[#15161b] hover:bg-[#c25b5e] text-white text-sm font-bold uppercase tracking-widest whitespace-nowrap rounded-full transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(194,91,94,0.3)] hover:-translate-y-1 active:translate-y-0`}
                >
                  Write a Review
                </button>
              </div>

              {/* Review List */}
              <div className="col-span-1 md:col-span-2">
                {displayReviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    {displayReviews.map((review: any) => {
                      const reviewerName = review.userID?.name || review.name || "Anonymous";
                      const initial = reviewerName.charAt(0).toUpperCase();

                      return (
                        <div key={review._id} className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="flex text-[#dbba53] gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm ${i < review.rating ? "text-[#dbba53]" : "text-gray-200"}`}>
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                  </svg>
                                ))}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shadow-inner">
                                  <span className={`${headingFont.className} text-lg`}>{initial}</span>
                                </div>
                                <span className={`${bodyFont.className} font-bold text-[#15161b] uppercase text-sm tracking-wide`}>{reviewerName}</span>
                              </div>
                            </div>
                            <span className={`${bodyFont.className} text-[11px] font-bold tracking-widest text-gray-400 mt-1`}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`${bodyFont.className} text-[15px] text-gray-500 leading-relaxed`}>{review.text}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-50/50 rounded-[24px] border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </div>
                    <h4 className={`${headingFont.className} text-xl text-[#15161b] uppercase tracking-wide mb-2`}>No reviews yet</h4>
                    <p className={`${bodyFont.className} text-gray-500 max-w-sm`}>Be the first to share your thoughts about {product.name}!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={product._id}
        productSlug={product.slug}
      />
    </div>
  );
}
