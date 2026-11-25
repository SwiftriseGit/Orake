"use client";
import { useState } from "react";
import { textFont } from "@/lib/fonts";

const faqs = [
  {
    q: "Where do you ship Orake?",
    a: "Everywhere your gut needs us. We currently cover all major Indian pin codes and are building international shipping for the Orake diaspora worldwide. The gut revolution has no borders."
  },
  {
    q: "What's actually in your drinks?",
    a: "The good stuff. Full stop. Real fruit juice. 6g of prebiotic fiber per can. Zero artificial sweeteners, zero synthetic colors, zero compromise. If you can't find it in nature, it doesn't find its way into our cans."
  },
  {
    q: "Are the cans recyclable?",
    a: "100% aluminum. Infinitely recyclable. Because the planet's microbiome deserves as much care as yours. Crush it, bin it, repeat."
  },
  {
    q: "What if my package arrives damaged?",
    a: "We rage too when that happens. Snap a photo of the damage, hit us up via the contact form above, and our team will ship a fresh batch immediately — no bureaucracy, no endless back-and-forth."
  },
  {
    q: "Do you offer wholesale pricing?",
    a: "Yes — and we love stocking Orake in spaces where people push themselves: gyms, co-working spaces, wellness studios, cafes. Select 'Wholesale' in the contact form and our distribution team will get back to you within 48 hours."
  }
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="flex-1 space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            onClick={() => setOpenIdx(isOpen ? -1 : idx)}
            className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border ${isOpen ? "bg-[#de3e4f] text-white border-[#de3e4f] shadow-xl shadow-red-600/20" : "bg-white text-[#15161b] border-gray-200 shadow-sm hover:shadow-md"
              }`}
          >
            <div className="px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
              <h4 className={`${textFont.className} text-xl sm:text-2xl font-medium tracking-wide ${isOpen ? "text-white" : "text-[#15161b]"}`}>
                {faq.q}
              </h4>
              <span className={`text-3xl transition-transform duration-300 leading-none ${isOpen ? "rotate-180" : ""}`}>
                {isOpen ? "−" : "+"}
              </span>
            </div>
            <div className={`overflow-hidden transition-all duration-300 px-6 sm:px-8 ${isOpen ? "max-h-[300px] pb-6 sm:pb-8 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className={isOpen ? "text-white/95 text-lg leading-relaxed font-light" : "text-gray-500 text-lg leading-relaxed font-light"}>
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
