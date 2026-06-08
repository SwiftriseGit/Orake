'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, User, Heart, Menu, X, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartWishlistStore } from "@/store/useCartWishlistStore";
import { getCartCount } from "@/actions/cart";
import { getWishlistCount } from "@/actions/wishlist";

import { useGuestWishlistStore } from "@/store/useGuestWishlistStore";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/products", label: "Products" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/become-a-partner", label: "Become a Partner" },
  { path: "/blog", label: "Blogs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const session = authClient.useSession();
  const isAuthenticated = !!session.data?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openAuthModal } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSubscribed(localStorage.getItem("orake_subscribed") === "true");

    const handleSubscribed = () => setIsSubscribed(true);
    window.addEventListener("orake_subscribed", handleSubscribed);
    return () => window.removeEventListener("orake_subscribed", handleSubscribed);
  }, []);

  const { cartCount, wishlistCount, setCartCount, setWishlistCount } = useCartWishlistStore();
  const guestWishlist = useGuestWishlistStore();

  useEffect(() => {
    // Cart count: works for both auth & guest (server handles cookies)
    getCartCount().then(setCartCount);

    if (isAuthenticated) {
      // Logged-in: wishlist from DB
      getWishlistCount().then(setWishlistCount);
    } else {
      // Guest: wishlist from localStorage
      guestWishlist.hydrate();
      setWishlistCount(guestWishlist.slugs.length);
    }
  }, [isAuthenticated, setCartCount, setWishlistCount, guestWishlist.slugs.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${scrolled || (pathname.startsWith("/products/") && pathname.split('/').length > 2) ? "bg-[#c25b5e] shadow-md" : "bg-transparent py-2"
        }`}
    >
      {/* ✅ FIXED CONTAINER */}
      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
                <div className="flex h-16 items-center justify-between lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 sm:h-10 items-center">
              <Image
                src="/orake-white-logo.svg"
                alt="Logo"
                width={110}
                height={36}
                className={`h-full w-auto object-contain transition-all duration-500 ${scrolled
                    ? "[filter:brightness(0)_saturate(100%)_invert(78%)_sepia(60%)_saturate(500%)_hue-rotate(5deg)_brightness(105%)]"
                    : ""
                  }`}
                priority
              />
            </div>
          </Link>

          {/* ✅ DESKTOP NAV (FIXED BREAKPOINT) */}
          <div className="hidden flex-1 items-center justify-center lg:flex lg:gap-4 xl:gap-6 lg:mx-4 xl:mx-6">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path ||
                (link.path === "/" && pathname === "/");

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={handleNavClick}
                  className={`group relative px-2 py-2 text-[12px] lg:text-[13px] xl:text-[14px] font-bold uppercase tracking-[0.16em] transition-colors duration-300
                    ${scrolled
                      ? "text-[#f6efe2] hover:text-[#d4a64a]"
                      : "text-[#f6efe2] hover:text-[#f2c56f]"
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-[2px] rounded transition-all duration-300
                      ${isActive
                        ? "w-[calc(100%-1rem)] opacity-100 bg-[#f2c56f]"
                        : "w-0 opacity-0 group-hover:w-[calc(100%-1rem)] group-hover:opacity-70 bg-[#f2c56f]"
                      }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Icons + Hamburger */}
          <div className="flex items-center gap-4 lg:gap-6 lg:ml-2 xl:ml-8">
            {/* ✅ ICONS FIXED */}
            <div className="flex items-center gap-4 lg:gap-5 text-[#f6efe2]">
              <Link href="/wishlist" className="relative hover:scale-110 transition-all group">
                <Heart className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f2c56f] text-[10px] font-bold text-[#15161b] shadow-sm transition-all">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative hover:scale-110 transition-all group">
                <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f2c56f] text-[10px] font-bold text-[#15161b] shadow-sm transition-all">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <Link href="/account" className="hover:scale-110 transition-all">
                  <User className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="group flex items-center transition-all duration-300"
                >
                  {/* Mobile: Just Icon */}
                  <LogIn className="h-5 w-5 sm:hidden hover:scale-110 transition-transform" strokeWidth={2} />

                  {/* Desktop: Full Button */}
                  <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#f2c56f] text-[12px] lg:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ${scrolled
                      ? "text-[#f6efe2] hover:bg-[#f2c56f] hover:text-[#15161b]"
                      : "text-[#f6efe2] hover:bg-[#f2c56f] hover:text-[#15161b]"
                    }`}>
                    <LogIn className="h-3 w-3" strokeWidth={2.5} />
                    Sign In
                  </div>
                </button>
              )}
            </div>

            {/* ✅ BETTER HAMBURGER */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center rounded-lg text-white bg-white/10 p-2 backdrop-blur-md hover:bg-[#de3e4f] transition-all duration-300 lg:hidden"
            >
              {menuOpen ? (
                <X className="h-8 w-8 " strokeWidth={2.2} />
              ) : (
                <Menu className="h-8 w-8 " strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ✅ MOBILE SIDEBAR FIXED */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm bg-[#15161b] border-l border-white/10 transition-all duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col p-6">

          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#de3e4f]/30">
            <div>
              <div className="text-2xl font-bold text-white uppercase">
                Orake
              </div>
              <div className="text-[10px] tracking-[0.3em] text-[#de3e4f] uppercase">
                Menu
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-full text-white bg-white/10 hover:bg-[#de3e4f] transition"
            >
              <X className="h-6 w-6" strokeWidth={2.2} />
            </button>
          </div>

          {/* Links */}
          <div className="mt-8 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path ||
                (link.path === "/" && pathname === "/");

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={handleNavClick}
                  className={`px-4 py-5 text-sm font-bold uppercase tracking-[0.2em] transition-all border-b border-white/5
                    ${isActive
                      ? "text-[#de3e4f]"
                      : "text-white/80 hover:bg-[#de3e4f] hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {!isAuthenticated && !isSubscribed && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("open-signup-popup"));
                }}
                className="mt-6 w-full py-4 bg-[#f2c56f] text-[#15161b] text-sm font-bold uppercase tracking-[0.2em] rounded-xl transition-all duration-300 hover:bg-white"
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}