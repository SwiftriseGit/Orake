"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Eye, X, Loader2, Trash2, RotateCcw, ShieldAlert, Phone, Mail, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { adminTitleFont as tf, adminTextFont as tx } from "@/lib/fonts";
import { softDeleteUser, restoreUser } from "@/actions/admin-users";
import type { AdminUser } from "@/lib/data/admin-users";
import { useDebounce } from "@/hooks/useDebounce";

function ProviderBadge({ provider }: { provider?: string }) {
  const isGoogle = provider === "google";
  return (
    <span className={`${tx.className} inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isGoogle ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
      {isGoogle ? "Google" : "Email"}
    </span>
  );
}

function Avatar({ user }: { user: Pick<AdminUser, "image" | "name" | "isDelete"> }) {
  if (user.image) return <img src={user.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />;
  return <span className="text-white text-xs font-bold">{user.name?.charAt(0)?.toUpperCase() || "?"}</span>;
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl text-white flex items-center gap-2 ${ok ? "bg-green-500" : "bg-red-500"}`}>
      {ok ? "✓" : "✕"} {msg}
    </div>
  );
}

function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className={`${tx.className} flex items-center justify-between px-5 py-3 border-t border-gray-100`}>
      <span className="text-xs text-gray-400">{total} user{total !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
        <span className="text-xs font-semibold text-gray-600 px-2">{page} / {totalPages}</span>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

export default function AdminUsersClient({
  initialUsers,
  total,
  totalPages,
  currentPage,
  currentSearch,
  currentRole,
  currentProvider,
  currentShowDeleted
}: {
  initialUsers: AdminUser[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentRole: string;
  currentProvider: string;
  currentShowDeleted: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [optimisticUsers, setOptimisticUsers] = useState<AdminUser[]>(initialUsers);
  
  // Local state for debounced search
  const [searchValue, setSearchValue] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchValue, 350);

  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    setOptimisticUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateURL({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const updateURL = (updates: Record<string, string | number | boolean | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === false) {
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

  const openDetail = (user: AdminUser) => {
    setViewUser(user);
  };

  const confirmDoDelete = () => {
    if (!confirmDelete) return;
    
    // Optimistic UI
    setOptimisticUsers(prev => prev.map(u => u._id === confirmDelete._id ? { ...u, isDelete: true } : u));
    
    startTransition(async () => {
      const res = await softDeleteUser(confirmDelete._id.toString());
      setConfirmDelete(null);
      showToast(res.message, res.success);
      if (viewUser?._id === confirmDelete._id) setViewUser(null);
      // We don't manually refetch. URL remains the same, Server Actions don't auto-refresh Server Components without revalidatePath/updateTag.
      // But we can trigger a soft refresh to get the latest DB state:
      router.refresh(); 
    });
  };

  const handleRestore = (user: AdminUser) => {
    // Optimistic UI
    setOptimisticUsers(prev => prev.map(u => u._id === user._id ? { ...u, isDelete: false } : u));
    
    startTransition(async () => {
      const res = await restoreUser(user._id.toString());
      showToast(res.message, res.success);
      router.refresh();
    });
  };

  const hasActiveFilters = searchValue || currentRole !== "all" || currentProvider !== "all";

  return (
    <div className="flex flex-col h-full gap-4">
      {toast && <Toast {...toast} />}

      {/* HEADER */}
      <div className="shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className={`${tf.className} text-2xl md:text-3xl uppercase tracking-wide text-[#15161b]`}>Users</h1>
            <p className={`${tx.className} text-gray-400 text-xs uppercase tracking-wider mt-0.5`}>
              {isPending ? "Updating…" : `${total} ${currentShowDeleted ? "deleted" : "active"} user${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => updateURL({ showDeleted: false, page: 1 })}
              className={`${tx.className} px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${!currentShowDeleted ? "bg-[#15161b] text-white border-[#15161b]" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}>
              Active
            </button>
            <button onClick={() => updateURL({ showDeleted: true, page: 1 })}
              className={`${tx.className} px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${currentShowDeleted ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}>
              Deleted
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Name, email, phone…" value={searchValue} onChange={e => setSearchValue(e.target.value)}
              className={`${tx.className} bg-white border border-gray-200 pl-9 pr-8 py-2 rounded-xl text-sm text-[#15161b] placeholder-gray-400 focus:border-[#c25b5e] focus:outline-none w-52 sm:w-64`} />
            {searchValue && <button onClick={() => setSearchValue("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
          </div>
          <select value={currentRole} onChange={e => updateURL({ role: e.target.value, page: 1 })}
            className={`${tx.className} bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 focus:border-[#c25b5e] focus:outline-none cursor-pointer`}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select value={currentProvider} onChange={e => updateURL({ provider: e.target.value, page: 1 })}
            className={`${tx.className} bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 focus:border-[#c25b5e] focus:outline-none cursor-pointer`}>
            <option value="all">All Providers</option>
            <option value="google">Google</option>
            <option value="credential">Email</option>
          </select>
          {hasActiveFilters && (
            <button onClick={() => { setSearchValue(""); updateURL({ search: null, role: null, provider: null, page: 1 }); }}
              className={`${tx.className} px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center gap-1`}>
              <X size={10} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className={`flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {optimisticUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className={`${tx.className} text-sm text-gray-400`}>No users found</p>
              {hasActiveFilters && <button onClick={() => { setSearchValue(""); updateURL({ search: null, role: null, provider: null, page: 1 }); }} className={`${tx.className} text-xs text-[#c25b5e] underline`}>Clear filters</button>}
            </div>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
                  {["User", "Provider", "Role", "Orders", "Status", "Joined", ""].map(h => (
                    <th key={h} className={`${tx.className} text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {optimisticUsers.map(user => (
                  <tr key={user._id} className={`transition-colors ${user.isDelete ? "bg-red-50/20" : "hover:bg-gray-50/60"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${!user.image ? (user.isDelete ? "bg-gray-300" : "bg-gradient-to-br from-[#c25b5e] to-[#de3e4f]") : "bg-gray-100"}`}>
                          <Avatar user={user} />
                        </div>
                        <div className="min-w-0">
                          <p className={`${tx.className} text-sm font-bold truncate max-w-[130px] ${user.isDelete ? "line-through text-gray-400" : "text-[#15161b]"}`}>{user.name || "—"}</p>
                          <p className={`${tx.className} text-[11px] text-gray-400 truncate max-w-[130px]`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><ProviderBadge provider={user.provider} /></td>
                    <td className="px-5 py-3">
                      <span className={`${tx.className} text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${user.role === "admin" ? "bg-[#c25b5e]/10 text-[#c25b5e] ring-1 ring-[#c25b5e]/20" : "bg-gray-100 text-gray-500"}`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className={`${tx.className} px-5 py-3 text-sm font-semibold text-[#15161b]`}>{user.orderCount ?? 0}</td>
                    <td className="px-5 py-3">
                      <span className={`${tx.className} text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${user.isDelete ? "bg-red-100 text-red-600" : user.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {user.isDelete ? "Deleted" : user.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className={`${tx.className} px-5 py-3 text-xs text-gray-400 whitespace-nowrap`}>
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openDetail(user)} title="View" className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-[#c25b5e] hover:text-white flex items-center justify-center transition-colors"><Eye size={13} /></button>
                        {user.isDelete ? (
                          <button onClick={() => handleRestore(user)} disabled={isPending} title="Restore" className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-40"><RotateCcw size={12} /></button>
                        ) : (
                          <button onClick={() => setConfirmDelete(user)} disabled={isPending} title="Delete" className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-40"><Trash2 size={12} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={currentPage} totalPages={totalPages} total={total} onPage={(p) => updateURL({ page: p })} />
      </div>

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><ShieldAlert size={22} className="text-red-500" /></div>
            <h3 className={`${tf.className} text-xl uppercase text-center text-[#15161b] mb-1`}>Delete User?</h3>
            <p className={`${tx.className} text-center text-xs text-gray-400 mb-5`}>Blocks login · deletes cart, wishlist & addresses · orders kept</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${!confirmDelete.image ? "bg-gradient-to-br from-[#c25b5e] to-[#de3e4f]" : "bg-gray-100"}`}>
                <Avatar user={confirmDelete} />
              </div>
              <div><p className={`${tx.className} text-sm font-bold text-[#15161b]`}>{confirmDelete.name}</p><p className={`${tx.className} text-xs text-gray-400`}>{confirmDelete.email}</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className={`${tx.className} flex-1 bg-gray-100 hover:bg-gray-200 text-[#15161b] py-3 rounded-xl text-xs font-bold uppercase tracking-widest`}>Cancel</button>
              <button onClick={confirmDoDelete} disabled={isPending} className={`${tx.className} flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-50`}>
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {isPending ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL DRAWER */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end" onClick={() => setViewUser(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className={`${tf.className} text-lg uppercase tracking-wide text-[#15161b]`}>User Profile</h3>
              <button onClick={() => setViewUser(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#15161b]"><X size={16} /></button>
            </div>
            <div className="p-6 flex-1 space-y-5">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${!viewUser.image ? "bg-gradient-to-br from-[#c25b5e] to-[#de3e4f]" : "bg-gray-100"}`}>
                  <Avatar user={viewUser} />
                </div>
                <div className="min-w-0">
                  <p className={`${tf.className} text-xl text-[#15161b] uppercase tracking-wide truncate`}>{viewUser.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <ProviderBadge provider={viewUser.provider} />
                    <span className={`${tx.className} text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${viewUser.role === "admin" ? "bg-[#c25b5e]/10 text-[#c25b5e]" : "bg-gray-100 text-gray-600"}`}>{viewUser.role}</span>
                    <span className={`${tx.className} text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${viewUser.isDelete ? "bg-red-100 text-red-600" : viewUser.emailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {viewUser.isDelete ? "Deleted" : viewUser.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3"><Mail size={13} className="text-gray-400 shrink-0" /><span className={`${tx.className} text-sm text-gray-700 break-all`}>{viewUser.email}</span></div>
                {viewUser.phone && <div className="flex items-center gap-3"><Phone size={13} className="text-gray-400 shrink-0" /><span className={`${tx.className} text-sm text-gray-700`}>{viewUser.phone}</span></div>}
                <div className="flex items-center gap-3"><Calendar size={13} className="text-gray-400 shrink-0" /><span className={`${tx.className} text-sm text-gray-700`}>Joined {new Date(viewUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
              </div>
              <div>
                <p className={`${tx.className} text-[10px] text-gray-400 uppercase tracking-widest mb-2`}>Activity</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Orders", value: viewUser.orderCount ?? 0 },
                    { label: "Cart", value: viewUser.cartCount ?? 0 },
                    { label: "Wishlist", value: viewUser.wishlistCount ?? 0 },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className={`${tf.className} text-2xl text-[#15161b]`}>{s.value}</p>
                      <p className={`${tx.className} text-[9px] text-gray-400 uppercase tracking-widest mt-0.5`}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className={`${tx.className} text-[9px] text-gray-400 uppercase tracking-widest mb-1`}>User ID</p>
                <p className={`${tx.className} text-[10px] font-mono text-gray-500 break-all select-all`}>{viewUser._id?.toString()}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              {viewUser.isDelete ? (
                <button onClick={() => { handleRestore(viewUser); setViewUser(null); }} disabled={isPending}
                  className={`${tx.className} w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-green-500/20 disabled:opacity-50`}>
                  {isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Restore Account
                </button>
              ) : (
                <button onClick={() => { setConfirmDelete(viewUser); setViewUser(null); }} disabled={isPending}
                  className={`${tx.className} w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-50`}>
                  <Trash2 size={13} /> Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
