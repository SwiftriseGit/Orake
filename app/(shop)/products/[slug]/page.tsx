import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/product";
import { getProductReviews } from "@/lib/data/review";
import { getUserWishlist } from "@/lib/data/wishlist";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductGallery from "@/components/Product/ProductGallery";
import ProductInfo from "@/components/Product/ProductInfo";
import ProductTabs from "@/components/Product/ProductTabs";
import { getFeaturedProducts } from "@/lib/data/product";
import { bodyFont } from "@/lib/fonts";

import { Suspense } from "react";

import { getOrders } from "@/lib/data/order";

async function ProductDetailsContent({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const product = await getProductBySlug(slug);
    
    if (!product) {
        return notFound();
    }

    // Fetch product reviews, wishlist status, and orders
    const wishlistItems = await getUserWishlist();
    const reviews = await getProductReviews(product._id);
    const ordersData = await getOrders();
    const isFirstOrder = ordersData.total === 0;
    
    const isWishlisted = wishlistItems.includes(product._id.toString());

    // Prepare gallery images
    const mainImageUrl = typeof product.image === 'string' ? product.image : (product.image as any)?.url || '';
    let galleryImages = [mainImageUrl];
    
    if (product.subImages && product.subImages.length > 0) {
        galleryImages = product.subImages.map((img: any) => typeof img === 'string' ? img : img?.url || '');
    }

    const allProducts = await getFeaturedProducts();
    const relatedProducts = allProducts.filter(p => p._id !== product._id);
    const relatedProduct = relatedProducts.length > 0 ? relatedProducts[0] : allProducts[0];

    return (
        <>
            {/* Product Top Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
                {/* LEFT: Image Gallery */}
                <ProductGallery galleryImages={galleryImages} productName={product.name} />

                {/* RIGHT: Product Info */}
                <ProductInfo product={product} relatedProduct={relatedProduct} initialIsWishlisted={isWishlisted} isFirstOrder={isFirstOrder} />
            </div>

            {/* Bottom Info Tabs */}
            <ProductTabs product={product} reviews={reviews} />
        </>
    );
}

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <main className="bg-[#fafafa] min-h-screen pt-24 pb-20 selection:bg-[#c25b5e] selection:text-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-8 mt-2">
                <Link href="/products" className={`${bodyFont.className} inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#c25b5e] transition-colors`}>
                    <ArrowLeft size={16} strokeWidth={2.5} />
                    Back to Products
                </Link>
            </div>

            <Suspense fallback={<div className="max-w-7xl mx-auto px-6 text-center text-gray-400 py-20 font-bold uppercase tracking-wider">Loading product details...</div>}>
                <ProductDetailsContent params={params} />
            </Suspense>
        </main>
    );
}
