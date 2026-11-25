"use client";
import { useState } from "react";
import { Save, Store, Truck, CreditCard, Bell, Shield } from "lucide-react";
import { titleFont, textFont } from "@/lib/fonts";


export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "store", label: "Store Info", icon: Store },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${titleFont.className} text-3xl uppercase tracking-wide text-[#15161b]`}>Settings</h1>
          <p className={`${textFont.className} text-gray-400 text-sm uppercase tracking-wider`}>Manage your store configuration</p>
        </div>
        <button onClick={handleSave} className={`${textFont.className} flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${saved ? "bg-green-500 text-white" : "bg-[#c25b5e] hover:bg-[#de3e4f] text-white shadow-lg shadow-[#c25b5e]/20"}`}>
          {saved ? <><span>✓</span> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`${textFont.className} flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "bg-[#15161b] text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {activeTab === "store" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className={`${titleFont.className} text-xl uppercase tracking-wide text-[#15161b] mb-4`}>Store Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Store Name</label>
                <input type="text" defaultValue="ORAKE" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Support Email</label>
                <input type="email" defaultValue="support@orake.in" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Phone</label>
                <input type="text" defaultValue="+91 1800-ORAKE" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Currency</label>
                <select defaultValue="INR" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`}>
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Store Description</label>
              <textarea rows={3} defaultValue="Premium prebiotic fiber soda. Zero sugar, real fruit juice, 6g prebiotic fiber per can."
                className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl resize-none`}
              />
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className={`${titleFont.className} text-xl uppercase tracking-wide text-[#15161b] mb-4`}>Shipping Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Free Shipping Threshold (₹)</label>
                <input type="number" defaultValue="999" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Flat Shipping Fee (₹)</label>
                <input type="number" defaultValue="99" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Processing Time</label>
                <input type="text" defaultValue="1-2 business days" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Delivery (Odisha)</label>
                <input type="text" defaultValue="2-4 business days" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <Truck size={18} className="text-yellow-600 shrink-0" />
              <p className={`${textFont.className} text-sm text-yellow-700`}>International shipping is not available yet.</p>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className={`${titleFont.className} text-xl uppercase tracking-wide text-[#15161b] mb-4`}>Payment Methods</h3>
            {[
              { name: "Razorpay", desc: "UPI, Cards, Wallets, NetBanking", enabled: true },
              { name: "Cash on Delivery", desc: "Collect payment on delivery", enabled: true },
              { name: "Stripe", desc: "International payments", enabled: false },
            ].map(method => (
              <div key={method.name} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className={`${textFont.className} text-sm font-bold text-[#15161b] uppercase tracking-wider`}>{method.name}</p>
                  <p className={`${textFont.className} text-xs text-gray-400`}>{method.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#c25b5e] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className={`${titleFont.className} text-xl uppercase tracking-wide text-[#15161b] mb-4`}>Notification Preferences</h3>
            {[
              { label: "New Order Alert", desc: "Get notified when a new order is placed", enabled: true },
              { label: "Low Stock Warning", desc: "Alert when product stock drops below 20", enabled: true },
              { label: "Customer Signup", desc: "Notify on new customer registration", enabled: false },
              { label: "Payment Received", desc: "Confirmation when payment is processed", enabled: true },
              { label: "Daily Reports", desc: "Receive daily sales summary via email", enabled: false },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className={`${textFont.className} text-sm font-bold text-[#15161b] uppercase tracking-wider`}>{n.label}</p>
                  <p className={`${textFont.className} text-xs text-gray-400`}>{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={n.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#c25b5e] rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6 max-w-2xl">
            <h3 className={`${titleFont.className} text-xl uppercase tracking-wide text-[#15161b] mb-4`}>Security Settings</h3>
            <div className="space-y-5">
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Admin Email</label>
                <input type="email" defaultValue="admin@orake.in" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Current Password</label>
                <input type="password" placeholder="••••••••" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
              <div>
                <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>New Password</label>
                <input type="password" placeholder="••••••••" className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Shield size={18} className="text-blue-600 shrink-0" />
              <p className={`${textFont.className} text-sm text-blue-700`}>Enable two-factor authentication for additional security (coming soon).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
