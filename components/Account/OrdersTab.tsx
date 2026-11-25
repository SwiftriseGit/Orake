"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, MapPin, CreditCard, Truck, Package, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cancelOrder } from "@/actions/order";
import { titleFont, textFont } from "@/lib/fonts";


const ORDERS_PER_PAGE = 3;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: string;
  isDelivered: boolean;
  deliveredAt?: string;
}

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Pending: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-600",
};

const paymentBadge: Record<string, { bg: string; text: string }> = {
  Online: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  COD: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
};

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <Package size={16} className="text-gray-300" />
      </div>
    );
  }
  return <img src={src} alt={alt} className="h-full object-contain" onError={() => setError(true)} />;
}

interface OrdersTabProps {
  initialOrders?: Order[];
}

export default function OrdersTab({ initialOrders = [] }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // Client-side pagination — no server calls needed
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return orders.slice(start, start + ORDERS_PER_PAGE);
  }, [orders, page]);

  const toggleExpand = (id: string) => setExpandedId(p => p === id ? null : id);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const getSubtotal = (items: OrderItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);
  const canCancel = (status: string) => status === "Pending" || status === "Processing";

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await cancelOrder(id);
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "Cancelled" } : o));
        setExpandedId(null);
        toast.success("Order cancelled");
      } else {
        toast.error(res.error || "Failed to cancel");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCancellingId(null);
      setShowCancelConfirm(null);
    }
  };

  const changePage = (p: number) => {
    setPage(p);
    setExpandedId(null);
  };



  return (
    <div className="bg-white border border-gray-200 rounded-[2rem] p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${titleFont.className} text-xl sm:text-2xl uppercase tracking-wide text-[#15161b]`}>Order History</h3>
        {orders.length > 0 && <span className={`${textFont.className} text-xs text-gray-400`}>{orders.length} orders</span>}
      </div>

      {orders.length > 0 ? (
        <>
          <div className="space-y-3">
            {paginatedOrders.map(order => {
              const isExpanded = expandedId === order._id;
              const itemCount = order.orderItems.reduce((s, i) => s + i.quantity, 0);

              return (
                <div key={order._id} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? "border-[#c25b5e]/30 shadow-lg shadow-[#c25b5e]/5" : "border-gray-100 hover:border-gray-200"}`}>
                  {/* Summary */}
                  <button onClick={() => toggleExpand(order._id)} className="w-full p-4 sm:p-5 text-left">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex -space-x-2.5 shrink-0 pt-0.5 sm:pt-0">
                        {order.orderItems.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-white shadow-sm overflow-hidden p-1" style={{ zIndex: 10 - idx }}>
                            <ProductImage src={item.image} alt={item.name} />
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#15161b] rounded-xl flex items-center justify-center border-2 border-white shadow-sm" style={{ zIndex: 7 }}>
                            <span className={`${textFont.className} text-[9px] font-bold text-white`}>+{order.orderItems.length - 2}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                          <div className="min-w-0">
                            <p className={`${textFont.className} text-sm font-bold text-[#15161b] truncate`}>
                              {order.orderItems.length === 1 ? order.orderItems[0].name : `${order.orderItems[0].name} + ${order.orderItems.length - 1} more`}
                            </p>
                            <p className={`${textFont.className} text-[11px] text-gray-400 mt-0.5`}>
                              <span className="font-mono font-semibold text-[#c25b5e] mr-1.5">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                              • {formatDate(order.createdAt)} • {itemCount} {itemCount === 1 ? "item" : "items"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap sm:flex-nowrap">
                            <span className={`${textFont.className} text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${paymentBadge[order.paymentMethod]?.bg || "bg-gray-50 border-gray-200"} ${paymentBadge[order.paymentMethod]?.text || "text-gray-600"}`}>
                              {order.paymentMethod === "COD" ? "COD" : "Paid"}
                            </span>
                            <span className={`${textFont.className} text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                              {order.status}
                            </span>
                            <p className={`${titleFont.className} text-base sm:text-lg text-[#15161b] ml-auto sm:ml-2 min-w-[60px] text-right`}>₹{order.totalPrice}</p>
                            <ChevronDown size={14} className={`text-gray-300 transition-transform duration-300 shrink-0 hidden sm:block ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 sm:px-5 pb-5">
                      <div className="pt-4 pb-2">
                        <p className={`${textFont.className} text-[10px] text-gray-400 uppercase tracking-widest mb-3`}>Items Ordered</p>
                        <div className="space-y-0.5">
                          {order.orderItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
                              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 p-1 overflow-hidden">
                                <ProductImage src={item.image} alt={item.name} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`${textFont.className} text-sm font-bold text-[#15161b] truncate`}>{item.name}</p>
                                <p className={`${textFont.className} text-xs text-gray-400`}>Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                              <p className={`${textFont.className} text-sm font-bold text-[#15161b] shrink-0`}>₹{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                        <div className="space-y-3">
                          <div>
                            <p className={`${textFont.className} text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5`}><MapPin size={10} /> Shipping To</p>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className={`${textFont.className} text-sm font-bold text-[#15161b]`}>{order.shippingAddress.fullName}</p>
                              <p className={`${textFont.className} text-xs text-gray-500 mt-0.5`}>{order.shippingAddress.phone}</p>
                              <p className={`${textFont.className} text-xs text-gray-500 mt-1 leading-relaxed`}>
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className={`${textFont.className} text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5`}><CreditCard size={10} /> Payment</p>
                            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className={`${textFont.className} text-sm font-semibold text-[#15161b]`}>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                                <p className={`${textFont.className} text-xs ${order.isPaid ? "text-green-600" : "text-amber-600"} mt-0.5`}>
                                  {order.isPaid && order.paidAt ? `Paid on ${formatDate(order.paidAt)}` : "Payment pending"}
                                </p>
                              </div>
                              <span className={`${textFont.className} text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${order.isPaid ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                {order.isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className={`${textFont.className} text-[10px] text-gray-400 uppercase tracking-widest mb-1.5`}>Price Summary</p>
                          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between">
                              <span className={`${textFont.className} text-xs text-gray-500`}>Subtotal ({order.orderItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                              <span className={`${textFont.className} text-xs font-semibold text-[#15161b]`}>₹{getSubtotal(order.orderItems)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`${textFont.className} text-xs text-gray-500`}>Shipping</span>
                              <span className={`${textFont.className} text-xs font-semibold ${order.shippingPrice === 0 ? "text-green-600" : "text-[#15161b]"}`}>
                                {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}
                              </span>
                            </div>
                            {order.taxPrice > 0 && (
                              <div className="flex justify-between">
                                <span className={`${textFont.className} text-xs text-gray-500`}>Tax</span>
                                <span className={`${textFont.className} text-xs font-semibold text-[#15161b]`}>₹{order.taxPrice}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className={`${titleFont.className} text-sm uppercase text-[#15161b]`}>Total</span>
                              <span className={`${titleFont.className} text-sm text-[#c25b5e]`}>₹{order.totalPrice}</span>
                            </div>
                          </div>

                          {order.isDelivered && order.deliveredAt && (
                            <div className="mt-2.5 bg-green-50 rounded-xl p-3 flex items-center gap-2.5">
                              <Truck size={14} className="text-green-600 shrink-0" />
                              <p className={`${textFont.className} text-xs text-green-700`}>Delivered on <span className="font-bold">{formatDate(order.deliveredAt)}</span></p>
                            </div>
                          )}
                          {!order.isDelivered && order.status !== "Cancelled" && (
                            <div className="mt-2.5 bg-blue-50 rounded-xl p-3 flex items-center gap-2.5">
                              <Package size={14} className="text-blue-600 shrink-0" />
                              <p className={`${textFont.className} text-xs text-blue-700`}>
                                {order.status === "Shipped" ? "Your order is on the way!" : "Your order is being prepared"}
                              </p>
                            </div>
                          )}
                          {order.status === "Cancelled" && (
                            <div className="mt-2.5 bg-red-50 rounded-xl p-3 flex items-center gap-2.5">
                              <XCircle size={14} className="text-red-500 shrink-0" />
                              <p className={`${textFont.className} text-xs text-red-600`}>This order has been cancelled</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-5 mt-3 border-t border-gray-100">
                        {(order.status === "Shipped" || order.status === "Processing") && (
                          <button className={`${textFont.className} flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white bg-[#15161b] hover:bg-[#c25b5e] py-2.5 px-4 rounded-xl transition-all`}>
                            <Truck size={13} /> Track Order
                          </button>
                        )}
                        {canCancel(order.status) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(order._id); }}
                            className={`${textFont.className} flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 py-2.5 px-4 rounded-xl transition-colors`}
                          >
                            <XCircle size={13} /> Cancel Order
                          </button>
                        )}
                        {order.status === "Delivered" && (
                          <button className={`${textFont.className} flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 py-2.5 px-4 rounded-xl transition-colors`}>
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => changePage(Math.max(1, page - 1))} disabled={page === 1}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => changePage(p)}
                  className={`${textFont.className} w-9 h-9 rounded-xl text-xs font-bold transition-all ${p === page ? "bg-[#15161b] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => changePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
          <p className={`${textFont.className} text-gray-400 text-sm uppercase tracking-wider`}>No orders yet</p>
          <Link href="/products" className={`${textFont.className} inline-block mt-4 bg-[#c25b5e] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#de3e4f] transition-colors`}>
            Start Shopping
          </Link>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCancelConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 sm:p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} className="text-red-500" />
            </div>
            <h3 className={`${titleFont.className} text-xl uppercase tracking-wide text-[#15161b] mb-2`}>Cancel Order?</h3>
            <p className={`${textFont.className} text-gray-400 text-sm mb-6`}>This action cannot be undone. Your order will be cancelled and any payment will be refunded.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(null)} className={`${textFont.className} flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors`}>
                Keep Order
              </button>
              <button onClick={() => handleCancel(showCancelConfirm)} disabled={cancellingId === showCancelConfirm}
                className={`${textFont.className} flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}>
                {cancellingId === showCancelConfirm && <Loader2 size={13} className="animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
