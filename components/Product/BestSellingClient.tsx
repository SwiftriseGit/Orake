'use client';

import { useState } from "react";
import { motion } from "framer-motion";

import ProductCard from "@/components/Product/ProductCard";
import { ProductType } from "@/models/Product"
import { textFont } from "@/lib/fonts";



const categoryTabs = ['All', 'New Drops', 'Sale'];
export default function BestSellingClient({ initialProducts, initialWishlistSlugs, pastOrdersCount = 1 }: { initialProducts: ProductType[], initialWishlistSlugs: string[], pastOrdersCount?: number }) {
	const [activeTab, setActiveTab] = useState('All');


	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1, delayChildren: 0.2 }
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 40 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { type: "spring", stiffness: 150, damping: 15 } as any
		}
	};

	const isFirstOrder = pastOrdersCount === 0;

	return (
		<div className="min-h-screen bg-white">

			{/* ━━━ Category Tabs + Products ━━━ */}
			<section className="bg-white py-10 md:py-16 px-4 sm:px-8 lg:px-20">
				<div className="max-w-7xl mx-auto">

					{/* Category Tabs Row */}
					<div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
						<div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
							{categoryTabs.map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`${textFont.className} px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-300 border-2 whitespace-nowrap
										${activeTab === tab
											? 'bg-[#15161b] text-white border-[#15161b] shadow-lg'
											: 'bg-transparent text-gray-500 border-gray-200 hover:border-[#15161b] hover:text-[#15161b]'
										}`}
								>
									{tab}
								</button>
							))}
						</div>
						<span className={`${textFont.className} text-gray-400 text-xs md:text-sm tracking-widest uppercase hidden sm:block shrink-0`}>
							{initialProducts.length} Products
						</span>
					</div>

					{/* Product Grid */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: false, margin: "-50px" }}
					>
						{initialProducts.length === 0 ? (
							<div className="py-24 text-center">
								<p className={`${textFont.className} text-gray-400 text-lg sm:text-xl uppercase tracking-[0.2em] font-bold`}>
									No products available
								</p>
								<p className={`${textFont.className} text-gray-500 mt-3 text-sm`}>
									We're currently restocking. Check back soon for new drops!
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto gap-x-10 md:gap-x-16 gap-y-24 md:gap-y-28 pt-6 md:pt-10 justify-items-center">
								{initialProducts.map((product, index) => (
									<motion.div key={index} variants={itemVariants} className="w-full max-w-[340px]">
										<ProductCard product={product} isWishlist={initialWishlistSlugs.includes(product._id)} isFirstOrder={isFirstOrder} />
									</motion.div>
								))}
							</div>
						)}
					</motion.div>

				</div>
			</section>



		</div>
	);
}