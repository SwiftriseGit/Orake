"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Package, X } from "lucide-react";
import { titleFont, textFont } from "@/lib/fonts";
import Link from "next/link";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  paymentMethod?: string;
}

export default function OrderSuccessModal({ isOpen, onClose, orderId, paymentMethod = "Razorpay" }: OrderSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isCOD = paymentMethod === "COD";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6 py-4 sm:py-6 bg-black/60 backdrop-blur-md">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-[480px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8 sm:p-10 text-center"
          >
            {/* Close button */}
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>

            <h3 className={`${titleFont.className} text-2xl sm:text-3xl uppercase tracking-wide text-[#15161b] mb-4`}>
              {isCOD ? "Order Placed!" : "Payment Successful!"}
            </h3>
            
            <p className={`${textFont.className} text-gray-500 text-sm sm:text-base mb-2`}>
              {isCOD
                ? "Your order has been placed successfully! You can pay when your order arrives at your doorstep."
                : "Thank you for your order. We've received your payment and are processing your order right away."}
            </p>
            
            {orderId && (
              <p className={`${textFont.className} text-gray-400 text-xs sm:text-sm mb-8`}>
                Order ID: <span className="font-semibold text-[#15161b] font-mono">#{orderId}</span>
              </p>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href="/account"
                onClick={onClose}
                className={`${textFont.className} w-full bg-[#15161b] hover:bg-[#c25b5e] text-white py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-[0_10px_30px_rgba(194,91,94,0.3)] flex items-center justify-center gap-2`}
              >
                <Package size={18} /> View Orders
              </Link>
              <Link
                href="/products"
                className={`${textFont.className} w-full bg-gray-100 hover:bg-gray-200 text-[#15161b] py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold uppercase tracking-wider transition-colors text-center`}
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

