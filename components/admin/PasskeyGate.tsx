"use client";
import { useState, useTransition } from "react";
import { KeyRound, Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { verifyAdminPasskey } from "@/actions/admin-auth";
import { titleFont, textFont } from "@/lib/fonts";


export default function PasskeyGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await verifyAdminPasskey(key);
        if (res.success) {
          setUnlocked(true);
        } else {
          setError(res.error || "Invalid passkey. Please check and try again.");
          setKey("");
        }
      } catch (err: any) {
        setError(err?.message || "Unable to verify passkey. Please try again.");
      }
    });
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#15161b] flex items-center justify-center p-4">
      {/* Background glows */}
      <div className="absolute w-96 h-96 bg-[#c25b5e]/10 rounded-full blur-[120px] -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-64 h-64 bg-[#dbba53]/5 rounded-full blur-[80px] bottom-20 -left-10 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className={`${titleFont.className} text-white text-4xl uppercase tracking-[0.3em]`}>ORAKE</span>
          <p className={`${textFont.className} text-gray-500 text-[10px] uppercase tracking-[0.4em] mt-1`}>Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#c25b5e]/15 flex items-center justify-center">
              <KeyRound size={18} className="text-[#c25b5e]" />
            </div>
            <div>
              <h1 className={`${titleFont.className} text-white text-xl uppercase tracking-wide`}>Passkey Required</h1>
              <p className={`${textFont.className} text-gray-500 text-xs uppercase tracking-wider`}>Enter key to access dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="Enter passkey..."
                disabled={isPending}
                autoFocus
                className={`${textFont.className} w-full bg-white/5 border ${error ? "border-red-500/50" : "border-white/10"} focus:border-[#c25b5e] rounded-xl px-4 py-3.5 pr-12 text-white text-sm outline-none placeholder:text-gray-600 transition-colors disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <ShieldAlert size={14} className="shrink-0" />
                <p className={`${textFont.className} text-xs font-semibold`}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !key.trim()}
              className={`${textFont.className} w-full flex items-center justify-center gap-2 bg-[#c25b5e] hover:bg-[#de3e4f] text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(194,91,94,0.2)] hover:shadow-[0_10px_30px_rgba(194,91,94,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Verifying...</>
              ) : (
                <><KeyRound size={15} /> Unlock Dashboard</>
              )}
            </button>
          </form>
        </div>

        <p className={`${textFont.className} text-center text-gray-600 text-[10px] uppercase tracking-widest mt-6`}>
          Session resets on every page refresh
        </p>
      </div>
    </div>
  );
}
