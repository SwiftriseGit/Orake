"use client";
import { titleFont, textFont } from "@/lib/fonts";
import EmptyCart from "./EmptyCart";
import CartItem from "./CartItem";
import OrderSummary from "./OrderSummary";
import { updateCartItemQty, removeFromCart } from "@/actions/cart";
import { toast } from "sonner";
import { useCartWishlistStore } from "@/store/useCartWishlistStore";

interface CartItemType {
  id: number;
  name: string;
  flavor: string;
  price: number;
  oldPrice: number;
  qty: number;
  image: string;
}

export default function CartList({ initialItems: items, pastOrdersCount = 0 }: { initialItems: CartItemType[], pastOrdersCount?: number }) {

  const updateQty = async (id: number | string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);

    const res = await updateCartItemQty(id.toString(), newQty);
    if (!res.success) {
      toast.error(res.error || "Failed to update quantity");
    }
  };

  const { decrementCart } = useCartWishlistStore();

  const removeItem = async (id: number | string) => {
    const res = await removeFromCart(id.toString());
    if (!res.success) {
      toast.error(res.error || "Failed to remove item");
    } else {
      decrementCart(); // Decrement by 1 unique item
    }
  };

  const isFirstOrder = pastOrdersCount === 0;

  const displayItems = items.map(i => {
    if (isFirstOrder && i.oldPrice) {
      return {
        ...i,
        price: Math.round(i.oldPrice * 0.8)
      };
    }
    return i;
  });

  const subtotal = displayItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const savings = displayItems.reduce((sum, i) => {
    if (i.oldPrice && i.oldPrice > i.price) {
      return sum + (i.oldPrice - i.price) * i.qty;
    }
    return sum;
  }, 0);
  const total = subtotal;

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="px-4 sm:px-12 lg:px-20 py-8 md:py-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="space-y-4">
            {displayItems.map(item => (
              <CartItem key={item.id} item={item} onUpdateQty={updateQty} onRemove={removeItem} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <OrderSummary 
          subtotal={subtotal} 
          savings={savings} 
          total={total} 
          itemsQty={items.reduce((sum, i) => sum + i.qty, 0)}
          pastOrdersCount={pastOrdersCount}
        />
      </div>
    </div>
  );
}