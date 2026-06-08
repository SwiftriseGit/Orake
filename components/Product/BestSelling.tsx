import { getFeaturedProducts } from "@/lib/data/product";
import BestSellingClient from "./BestSellingClient";
import { getUserWishlist } from "@/lib/data/wishlist"
import { getOrders } from "@/lib/data/order";

export default async function BestSelling() {
    const wishlistSlugs = await getUserWishlist();
    const products = await getFeaturedProducts();
    const ordersData = await getOrders();
    const pastOrdersCount = ordersData.total || 0;
    
    return <BestSellingClient initialProducts={products} initialWishlistSlugs={wishlistSlugs} pastOrdersCount={pastOrdersCount} />;
}
