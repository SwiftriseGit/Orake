"use client";
import { motion } from "framer-motion";
import { titleFont, textFont } from "@/lib/fonts";
import { useAuthStore } from "@/store/useAuthStore";

export default function FooterBanner() {
	const { openAuthModal } = useAuthStore();
	return (
		<section className="relative h-[500px] sm:h-[600px] md:h-[800px] flex items-center justify-center text-center text-white bg-[#15161b] overflow-hidden">

			{/* ━━━ Background Image with Slow Zoom Animation ━━━ */}
			<motion.div
				initial={{ scale: 1.15 }}
				whileInView={{ scale: 1.05 }}
				transition={{ duration: 15, ease: "easeOut" }}
				viewport={{ once: false }}
				className="absolute inset-0 bg-cover bg-center md:bg-[center_top_-20%]"
				style={{ backgroundImage: "url('/abousec.png')" }}
			/>

			{/* ━━━ Aggressive Dual Gradient ━━━ */}
			<div className="absolute inset-0 bg-gradient-to-t from-[#15161b] via-[#15161b]/30 to-[#de3e4f]/20 mix-blend-multiply" />
			{/* Extra top gradient on mobile for better text contrast if the image is bright */}
			<div className="absolute inset-0 bg-gradient-to-b from-[#15161b]/70 via-transparent to-transparent md:hidden" />

			<div className="relative z-10 px-5 sm:px-6 flex flex-col items-center max-w-4xl w-full mt-8 md:mt-0">

				<motion.h4
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className={`${textFont.className} text-[#de3e4f] text-xs sm:text-sm md:text-base tracking-[0.3em] md:tracking-[0.4em] uppercase mb-5 md:mb-10 font-bold bg-[#15161b]/50 backdrop-blur-md px-5 py-2 md:px-6 md:py-2.5 rounded-full border border-[#de3e4f]/30 shadow-lg`}
				>
					Join The Underground
				</motion.h4>

				<motion.h2
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false }}
					transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
					className={`${titleFont.className} text-[clamp(3.5rem,11vw,7rem)] mb-5 md:mb-12 drop-shadow-[0_10px_30px_rgba(222,62,79,0.5)] leading-[0.9] tracking-widest uppercase`}
				>
					NEVER CRASH <br /> <span className="text-white">AGAIN.</span>
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false }}
					transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
					className={`${textFont.className} text-gray-300 mb-8 md:mb-16 text-sm sm:text-base md:text-xl leading-relaxed max-w-[300px] sm:max-w-xl md:max-w-2xl mx-auto font-light`}
				>
					Sign up for sms drops to get first access to our limited-run flavors, secret pop-up shows, and exclusive merch. The revolution is televised.
				</motion.p>

				<motion.button
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: false }}
					transition={{ duration: 0.6, type: "spring", bounce: 0.4, delay: 0.45 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => openAuthModal("signup")}
					className={`${textFont.className} bg-[#de3e4f] text-white px-8 py-3.5 sm:px-10 sm:py-4 md:px-12 md:py-5 rounded-full font-bold text-xs sm:text-sm md:text-lg uppercase tracking-widest hover:bg-black transition-colors shadow-[0_10px_30px_rgba(222,62,79,0.5)] border-2 border-transparent hover:border-[#de3e4f]`}
				>
					SIGN UP FOR ALERTS
				</motion.button>

			</div>
		</section>
	);
}
