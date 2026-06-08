import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Orake — The Soda Your Gut Was Waiting For",
  description: "Premium prebiotic fiber soda. Zero sugar, real fruit juice, 5G prebiotic fiber per can. Strawberry Vanilla and Ginger Lemon flavors.",
  keywords: "prebiotic fiber soda, zero sugar, gut health, real fruit, Orake",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.05em",
              fontWeight: "bold",
              background: "#15161b",
              color: "#f6efe2",
              border: "1px solid rgba(194,91,94,0.3)",
              borderRadius: "16px",
            },
            className: "shadow-[0_10px_40px_rgba(0,0,0,0.2)] uppercase text-[12px]",
          }}
        />
        {children}
      </body>
    </html>
  );
}

