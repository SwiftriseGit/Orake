import Image from "next/image";
import { MoveUpRight } from "lucide-react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { titleFont, textFont } from "@/lib/fonts";


const socials = [
  { Icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/share/1Hn6nruP6M/?mibextid=wwXIfr" },
  { Icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/drinkorake?utm_source=qr" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#c25b5e] text-white pt-10 overflow-hidden flex flex-col justify-between">
      {/* Decorative SVG background ( wave) */}
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none z-10 opacity-99 h-[80rem] sm:inset-0 sm:h-auto">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" className="w-full h-full min-h-[720px] sm:min-h-0">
          <defs>
            <linearGradient id="fg" x1="0" x2="1">
              <stop offset="0%" stopColor="#b93d41" stopOpacity="0.68" />
              <stop offset="100%" stopColor="#b93d41" stopOpacity="0.68" />
            </linearGradient>
          </defs>
          {/* continuous looping waves - duplicated side-by-side and translated for seamless flow */}
          <g>

            <g opacity="0.9">
              <g>
                <path d="M0,338 C200,240 480,410 720,360 C980,310 1100,340 1200,340 L1200,600 L0,600 Z" fill="url(#fg)" />
              </g>
              <g transform="translate(1200,0)">
                <path d="M0,340 C200,240 480,410 720,360 C980,310 1100,340 1200,340 L1200,600 L0,600 Z" fill="url(#fg)" />
              </g>
              <animateTransform attributeName="transform" type="translate" from="0 0" to="-1180 0" dur="4s" repeatCount="indefinite" />
            </g>
          </g>

        </svg>
      </div>

      {/* Top Main Container */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-16 lg:px-28 flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12 lg:gap-8 pb-6">

        {/* CTA Block + Logo */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2 z-20">
          {/* Logo */}
          <div className="mb-2">
            <Image src="/orake-white-logo.svg" alt="Orake" width={140} height={50} className="opacity-90" />
          </div>


          <h3 className={`${titleFont.className} text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[0.9] tracking-wider text-center lg:text-left`}>
            Thirsty for <br /> <span className="text-[#15161b]">more details?</span>
          </h3>
          <p className={`${textFont.className} text-lg lg:text-xl font-medium tracking-wide text-white/80 max-w-sm text-center lg:text-left mx-auto lg:mx-0`}>
            Reach out to our team for partnerships, orders, or just to talk flavors!
          </p>


        </div>

        {/* Links Grid */}
        <div className="w-full lg:w-1/2 z-20 flex flex-col">


          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-6">

            <div className="flex flex-col gap-3">
              <p className={`${titleFont.className} text-lg tracking-widest text-[#15161b] uppercase mb-2`}>Product</p>
              <a href="/products" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Our Drinks</a>
              <a href="/about" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Testimonials</a>
            </div>

            <div className="flex flex-col gap-3">
              <p className={`${titleFont.className} text-lg tracking-widest text-[#15161b] uppercase mb-2`}>Company</p>
              <a href="/blog" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Blog</a>
              <a href="/contact" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Contact</a>
            </div>

            <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
              <p className={`${titleFont.className} text-lg tracking-widest text-[#15161b] uppercase mb-2`}>Legal</p>
              <a href="/policies#terms" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Terms of Service</a>
              <a href="/policies#refund" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Refund Policy</a>
              <a href="/policies#shipping" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Shipping</a>
              <a href="/policies#cancellation" className={`${textFont.className} text-base hover:translate-x-2 transition-transform`}>Cancellation</a>
            </div>

          </div>
        </div>
      </div>


      {/* Divider row: email left, socials right */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-16 lg:px-28 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4 z-20 py-4">
        <div>
          <a href="mailto:contact@drinkorake.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 w-fit">
            <span className={`${titleFont.className} text-xl lg:text-2xl tracking-widest uppercase pb-1 border-b-2 border-white/40 group-hover:border-white transition-colors`}>
              contact@drinkorake.com
            </span>
            <div className="w-10 h-10 rounded-full bg-white text-[#c25b5e] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-md">
              <MoveUpRight size={20} className="stroke-[3px]" />
            </div>
          </a>
        </div>

        <div className="flex items-center gap-3">
          {socials.map(({ Icon, label, href }) => (
            <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white hover:text-[#c25b5e] flex items-center justify-center transition-all duration-300 text-white hover:scale-110 hover:shadow-lg">
              <Icon size={16} />
            </a>
          ))}



        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-16 lg:px-28 pt-6 pb-8 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 z-20 text-center md:text-left">
        <p className={`${textFont.className} text-sm text-white/80 font-medium tracking-wide`}>
          © 2026 <a href="https://swiftrise.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white">Swiftrise Solution Pvt Ltd</a>. ALL RIGHTS RESERVED.
        </p>

      </div>

    </footer>
  );
}
