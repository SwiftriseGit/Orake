"use client"
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { titleFont, textFont } from "@/lib/fonts";
import Link from "next/link";


export default function Advertising() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.5; // Slow down video to 50%
        }
    }, []);
    return (
        <section className="bg-white pb-20 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1400px] mx-auto relative rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl h-[400px] md:h-[500px] lg:h-[600px] group">
                <div className="absolute inset-0 bg-black/30 z-10 transition-colors duration-700 group-hover:bg-black/50" />
                <video
                    ref={videoRef}
                    src="/advertise.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover object-center filter saturate-110 transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6 }}
                        className={`${titleFont.className} text-5xl md:text-6xl lg:text-8xl text-white uppercase tracking-wider leading-[0.9] mb-4 drop-shadow-2xl`}
                    >
                        Unleash the <br className="md:hidden" /><span className="text-[#c25b5e]">Chaos</span>
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`${textFont.className} text-white/90 text-sm md:text-base lg:text-xl font-medium tracking-wide mb-8 max-w-2xl drop-shadow-md`}
                    >
                        The ultimate fusion of taste and prebiotic goodness. Refresh differently.
                    </motion.p>
                    <Link href="/products">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className={`${textFont.className} px-8 py-4 bg-[#c25b5e] text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-[#15161b] transition-colors shadow-2xl hover:scale-105 duration-300`}
                        >
                            Discover More
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    )
} 