"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Eye, Package, Truck, CheckCircle, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
import { adminTitleFont as tf, adminTextFont as tx } from "@/lib/fonts";
import { updateOrderStatus, updateOrderPaymentStatus } from "@/actions/admin-orders";
import type { AdminOrder } from "@/lib/data/admin-orders";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
const STATUS_COLORS: Record<string, string> = { Pending: "bg-gray-100 text-gray-600", Processing: "bg-yellow-100 text-yellow-700", Shipped: "bg-blue-100 text-blue-700", Delivered: "bg-green-100 text-green-700", Cancelled: "bg-red-100 text-red-600" };
const STATUS_ICONS: Record<string, any> = { Pending: Clock, Processing: Package, Shipped: Truck, Delivered: CheckCircle, Cancelled: X };

function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className={`${tx.className} flex items-center justify-between px-5 py-3 border-t border-gray-100`}>
      <span className="text-xs text-gray-400">{total} order{total !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
        <span className="text-xs font-semibold text-gray-600 px-2">{page} / {totalPages}</span>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

export default function AdminOrdersClient({ 
  initialOrders, 
  total, 
  totalPages, 
  currentPage,
  currentSearch,
  currentStatus
}: { 
  initialOrders: AdminOrder[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [optimisticOrders, setOptimisticOrders] = useState<AdminOrder[]>(initialOrders);
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);

  const [searchValue, setSearchValue] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchValue, 350);

  useEffect(() => {
    setOptimisticOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateURL({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const updateURL = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All") {
        if (params.has(key)) { params.delete(key); hasChanges = true; }
      } else {
        if (params.get(key) !== String(value)) { params.set(key, String(value)); hasChanges = true; }
      }
    });

    if (hasChanges) {
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    const isDelivered = status === "Delivered";
    setOptimisticOrders(prev => prev.map(o => o._id === id ? { 
      ...o, 
      status: status as AdminOrder["status"],
      isDelivered,
      isPaid: isDelivered ? true : o.isPaid 
    } : o));
    if (viewOrder?._id === id) {
      setViewOrder(p => p ? { 
        ...p, 
        status: status as AdminOrder["status"],
        isDelivered,
        isPaid: isDelivered ? true : p.isPaid 
      } : null);
    }
    
    startTransition(async () => {
      await updateOrderStatus(id, status as any);
    });
  };

  const handlePaymentToggle = (id: string, currentPaid: boolean) => {
    const nextPaid = !currentPaid;
    setOptimisticOrders(prev => prev.map(o => o._id === id ? { ...o, isPaid: nextPaid } : o));
    if (viewOrder?._id === id) {
      setViewOrder(p => p ? { ...p, isPaid: nextPaid } : null);
    }
    startTransition(async () => {
      await updateOrderPaymentStatus(id, nextPaid);
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="shrink-0 space-y-3">
        <div>
          <h1 className={`${tf.className} text-2xl md:text-3xl uppercase tracking-wide text-[#15161b]`}>Orders</h1>
          <p className={`${tx.className} text-gray-400 text-xs uppercase tracking-wider mt-0.5`}>
            {isPending ? "Updating…" : `${total} order${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Customer name or email…" value={searchValue} onChange={e => setSearchValue(e.target.value)}
              className={`${tx.className} w-full bg-white border border-gray-200 pl-9 pr-8 py-2 rounded-xl text-sm placeholder-gray-400 focus:border-[#c25b5e] focus:outline-none`} />
            {searchValue && <button onClick={() => setSearchValue("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["All", ...ORDER_STATUSES].map(s => {
              const Icon = STATUS_ICONS[s];
              return (
                <button key={s} onClick={() => updateURL({ status: s, page: 1 })}
                  className={`${tx.className} flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${currentStatus === s ? "bg-[#15161b] text-white border-[#15161b]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                  {Icon && <Icon size={9} />}{s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {optimisticOrders.length === 0 ? (
            <div className="flex items-center justify-center h-40"><p className={`${tx.className} text-sm text-gray-400`}>No orders found</p></div>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
                  {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map(h => (
                    <th key={h} className={`${tx.className} text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {optimisticOrders.map(order => {
                  const StatusIcon = STATUS_ICONS[order.status] || Package;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`${tx.className} text-xs font-mono font-bold text-[#c25b5e]`}>
                          #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className={`${tx.className} text-sm font-semibold text-[#15161b]`}>{order.customerName || "Unknown"}</p>
                        <p className={`${tx.className} text-[11px] text-gray-400`}>{order.customerEmail}</p>
                      </td>
                      <td className={`${tx.className} px-5 py-3 text-xs text-gray-500`}>{order.orderItems?.length} item{order.orderItems?.length !== 1 ? "s" : ""}</td>
                      <td className={`${tx.className} px-5 py-3 text-sm font-bold text-[#15161b]`}>₹{order.totalPrice?.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3">
                        <span className={`${tx.className} text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${order.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{order.isPaid ? "Paid" : "COD"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`${tx.className} text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${STATUS_COLORS[order.status]}`}>
                          <StatusIcon size={9} /> {order.status}
                        </span>
                      </td>
                      <td className={`${tx.className} px-5 py-3 text-xs text-gray-400 whitespace-nowrap`}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => setViewOrder(order)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#c25b5e] hover:text-white flex items-center justify-center transition-colors"><Eye size={13} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={total} onPage={(p) => updateURL({ page: p })} />
      </div>

      {viewOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div>
                <h3 className={`${tf.className} text-xl uppercase tracking-wide text-[#15161b]`}>Order Details</h3>
                <p className={`${tx.className} text-xs text-[#c25b5e] font-mono font-bold mt-0.5`}>#{viewOrder.orderNumber || viewOrder._id}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#15161b]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
                <div>
                  <p className={`${tx.className} text-[10px] text-gray-400 uppercase tracking-widest mb-1`}>Customer</p>
                  <p className={`${tx.className} text-sm font-bold text-[#15161b]`}>{viewOrder.customerName || "Unknown"}</p>
                  <p className={`${tx.className} text-xs text-gray-400`}>{viewOrder.customerEmail}</p>
                </div>
                <div>
                  <p className={`${tx.className} text-[10px] text-gray-400 uppercase tracking-widest mb-1`}>Ship To</p>
                  <p className={`${tx.className} text-sm text-gray-600 leading-relaxed`}>
                    {[viewOrder.shippingAddress?.street, viewOrder.shippingAddress?.city, viewOrder.shippingAddress?.state, viewOrder.shippingAddress?.postalCode].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              <div>
                <p className={`${tx.className} text-[10px] text-gray-400 uppercase tracking-widest mb-3`}>Items</p>
                <div className="space-y-1">
                  {viewOrder.orderItems?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 p-1">
                        <img src={item.image || "/can1.png"} alt={item.name} className="h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`${tx.className} text-sm font-bold text-[#15161b] truncate`}>{item.name}</p>
                        <p className={`${tx.className} text-xs text-gray-500 mt-0.5`}>Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <span className={`${tx.className} text-sm font-bold text-[#15161b]`}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 mt-2 border-t border-gray-100">
                  <span className={`${tf.className} text-lg uppercase text-[#15161b]`}>Total</span>
                  <span className={`${tf.className} text-lg text-[#c25b5e]`}>₹{viewOrder.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Payment Status & Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                <div>
                  <p className={`${tx.className} text-[10px] text-gray-400 uppercase tracking-widest`}>Payment Method: <span className="font-bold text-[#15161b]">{viewOrder.paymentMethod || "COD"}</span></p>
                  <p className={`${tx.className} text-xs font-bold mt-0.5 ${viewOrder.isPaid ? "text-green-600" : "text-amber-600"}`}>
                    {viewOrder.isPaid ? "✓ Paid" : "⏳ Unpaid (COD)"}
                  </p>
                </div>
                <button
                  disabled={isPending}
                  onClick={() => handlePaymentToggle(viewOrder._id, viewOrder.isPaid)}
                  className={`${tx.className} px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    viewOrder.isPaid
                      ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
                >
                  {viewOrder.isPaid ? "Mark Unpaid" : "Mark Paid"}
                </button>
              </div>

              <div>
                <p className={`${tx.className} text-[10px] text-gray-400 uppercase tracking-widest mb-2`}>Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map(s => {
                    const Icon = STATUS_ICONS[s];
                    return (
                      <button key={s} disabled={isPending} onClick={() => handleStatusUpdate(viewOrder._id, s)}
                        className={`${tx.className} flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${viewOrder.status === s ? "bg-[#c25b5e] text-white shadow-md shadow-[#c25b5e]/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {Icon && <Icon size={9} />}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
