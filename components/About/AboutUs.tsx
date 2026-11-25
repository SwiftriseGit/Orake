"use client";
import { motion } from "framer-motion";
import { titleFont, textFont } from "@/lib/fonts";


export default function AboutUs() {
	return (
		<section className="relative bg-[#e8e8e9] overflow-hidden py-24 md:py-40">
			{/* Subtle background texture dots */}
			<div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

			<div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8">
				<div className="flex flex-col lg:flex-row items-center gap-6 md:gap-12 lg:gap-24">

					{/* ─────── Left: Two Cans Stacked Vertically ─────── */}
					<motion.div 
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: false, margin: "-100px" }}
						transition={{ duration: 0.8, ease: "easeOut" }}
						className="relative flex flex-row items-center justify-center w-full lg:w-[45%] shrink-0 gap-4 md:gap-6"
					>
						{/* Left glow - yellow */}
						<div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-64 h-64 bg-[#dbba53] blur-[120px] opacity-15 pointer-events-none rounded-full" />
						{/* Right glow - pink */}
						<div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-64 h-64 bg-[#c25b5e] blur-[120px] opacity-15 pointer-events-none rounded-full" />

						{/* ── Can 1: Ginger Lemon (Yellow) — LEFT ── */}
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: false }}
							transition={{ duration: 0.7, ease: "easeOut" }}
							className="relative w-1/2 max-w-[220px] md:max-w-[260px] xl:max-w-[360px]"
						>
							<img
								src="/caneyellow.png"
								alt="Orake Ginger Lemon"
								className="w-full h-auto object-contain drop-shadow-[0_30px_40px_rgba(219,186,83,0.25)] transform rotate-[9deg]"
							/>
							{/* Floating Badge — 6g Prebiotic */}
							<motion.div
								initial={{ scale: 0 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.5 }}
								className="absolute -bottom-2 -left-2 md:left-0 w-16 h-16 md:w-[76px] md:h-[76px] xl:w-[96px] xl:h-[96px] bg-[#15161b] rounded-full flex flex-col items-center justify-center text-white border-[3px] border-[#e8e8e9] shadow-2xl z-20"
							>
								<span className={`${titleFont.className} text-xl md:text-2xl leading-none tracking-widest text-[#dbba53]`}>6G</span>
								<span className={`${textFont.className} text-[6px] md:text-[7px] font-bold uppercase tracking-[0.15em]`}>Prebiotic</span>
							</motion.div>
						</motion.div>

						{/* ── Can 2: Strawberry (Pink) — RIGHT ── */}
						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: false }}
							transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
							className="relative w-1/2 max-w-[220px] md:max-w-[260px] xl:max-w-[360px]"
						>
							<img
								src="/canepink.png"
								alt="Orake Strawberry Vanilla"
								className="w-full h-auto object-contain drop-shadow-[0_30px_40px_rgba(194,91,94,0.25)] transform -rotate-[6deg]"
							/>
							{/* Floating Badge — 0g Sucralose */}
							<motion.div
								initial={{ scale: 0 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.65, type: "spring", bounce: 0.5 }}
								className="absolute -bottom-2 -right-2 md:right-0 w-16 h-16 md:w-[76px] md:h-[76px] xl:w-[88px] xl:h-[88px] bg-[#15161b] rounded-full flex flex-col items-center justify-center text-white border-[3px] border-[#e8e8e9] shadow-2xl z-20"
							>
								<span className={`${titleFont.className} text-xl md:text-2xl leading-none tracking-widest text-[#c25b5e]`}>0G</span>
								<span className={`${textFont.className} text-[6px] md:text-[7px] font-bold uppercase tracking-[0.15em]`}>Sucralose</span>
							</motion.div>
						</motion.div>

					</motion.div>

					{/* ─────── Right: Content ─────── */}
					<motion.div 
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: false, margin: "-100px" }}
						transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
						className="w-full lg:w-[55%] text-center lg:text-left pt-12 md:pt-0"
					>
						<p className={`${textFont.className} text-[#c25b5e] text-sm font-bold uppercase tracking-[0.4em] mb-4`}>
							The Lab
						</p>

						<h2 className={`${titleFont.className} text-gray-900 leading-[0.9] mb-8 text-[3rem] sm:text-[4rem] md:text-[5rem] uppercase tracking-wide`}>
							WE KILLED <br />
							<span className="text-[#c25b5e]">THE CRASH.</span>
						</h2>

						<div className={`${textFont.className} text-gray-600 space-y-6 text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0`}>
							<p>
								Every soda you&apos;ve ever loved was quietly working against you. Sugary crashes, fake health drinks in pastel cans, the same lie in different colors. We were done with it.
							</p>
							<p>
								So we locked ourselves in a lab and rebuilt soda from the inside out — starting with your gut. 47 flavor iterations. Months of microbiome research. The result is Orake: 6g of real prebiotic fiber in every 250ml can, wrapped in flavors so good you&apos;ll forget it&apos;s good for you.
							</p>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-black/10">
							<div className="text-center lg:text-left">
								<p className={`${titleFont.className} text-4xl md:text-5xl text-[#15161b] mb-1`}>6G</p>
								<p className={`${textFont.className} text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]`}>Prebiotic Fiber</p>
							</div>
							<div className="text-center lg:text-left">
								<p className={`${titleFont.className} text-4xl md:text-5xl text-[#15161b] mb-1`}>100%</p>
								<p className={`${textFont.className} text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]`}>Real Fruit</p>
							</div>
							<div className="text-center lg:text-left">
								<p className={`${titleFont.className} text-4xl md:text-5xl text-[#15161b] mb-1`}>ZERO</p>
								<p className={`${textFont.className} text-[10px] md:text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]`}>Added Sugar</p>
							</div>
						</div>
					</motion.div>

				</div>
			</div>
		</section>
	);
}
