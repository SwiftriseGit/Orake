import type { Metadata } from "next";
import Hero from "@/components/Product/Hero";
import BestSelling from "@/components/Product/BestSelling";
import Advertising from "@/components/Product/Advertisement";
import ProductSkeleton from "@/components/Product/ProductSkeleton";
import { Suspense } from "react";
      
export const metadata: Metadata = {
  title: "Orake Products — Premium Prebiotic Fiber Sodas",
  description: "Shop Orake's lineup of zero-sugar prebiotic fiber sodas. Strawberry Vanilla and Ginger Lemon — real fruit juice, 6g prebiotic fiber, no crash.",
};

export default function ProductPage() {
	return (
		<div className="min-h-screen bg-white overflow-hidden">
			<Hero />
			<Suspense fallback={<ProductSkeleton />}>
				<BestSelling />
			</Suspense>
			<Advertising/>
 		 		 
		</div>
	);
}
