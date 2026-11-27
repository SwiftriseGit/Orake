"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { authClient, getAuthErrorMessage } from "@/lib/auth-client";
import { toast } from "sonner";
import { titleFont, textFont } from "@/lib/fonts";


export default function SettingsTab() {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const { data, error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true
      });

      if (error) {
        if (error.code === "INVALID_PASSWORD" || error.message?.toLowerCase().includes("invalid password") || error.message?.toLowerCase().includes("incorrect")) {
          toast.error("Current password is incorrect. Please try again.");
        } else if (error.code === "NO_PASSWORD" || error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND" || error.message?.toLowerCase().includes("oauth") || error.message?.toLowerCase().includes("provider")) {
          toast.error("Google sign-in accounts cannot update password here.");
        } else {
          toast.error(getAuthErrorMessage(error, "Failed to change password. Please try again."));
        }
        return;
      }

      toast.success("Password changed! Please log in again.");
      setTimeout(async () => {
        await authClient.signOut();
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Failed to change password. Please try again."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await authClient.deleteUser();

      if (error) {
        toast.error(getAuthErrorMessage(error, "Failed to delete account."));
      } else {
        toast.success("Account deleted. Goodbye!");
        setTimeout(async () => {
          await authClient.signOut();
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Failed to delete account. Please try again."));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
        <h3 className={`${titleFont.className} text-2xl uppercase tracking-wide text-[#15161b] mb-8`}>
          Change Password
        </h3>

        <div className="space-y-6 max-w-lg">
          <div>
            <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type={showOldPass ? "text" : "password"}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 pl-11 pr-12 py-3 text-sm font-medium text-[#15161b] placeholder-gray-400 focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`}
              />
              <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15161b] transition-colors">
                {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type={showNewPass ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 pl-11 pr-12 py-3 text-sm font-medium text-[#15161b] placeholder-gray-400 focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`}
              />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15161b] transition-colors">
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className={`${textFont.className} block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2`}>Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm font-medium text-[#15161b] placeholder-gray-400 focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`}
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className={`${textFont.className} w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 bg-[#15161b] hover:bg-[#c25b5e] text-white hover:shadow-[0_10px_30px_rgba(194,91,94,0.3)] disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {changingPassword && <Loader2 size={14} className="animate-spin" />}
            Update Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h4 className={`${titleFont.className} text-lg uppercase tracking-wide text-red-500 mb-3`}>
            Danger Zone
          </h4>
          <p className={`${textFont.className} text-gray-400 text-sm mb-4`}>
            Once you delete your account, there&apos;s no going back. All your data will be permanently removed.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`${textFont.className} bg-red-50 border-2 border-red-200 text-red-500 hover:bg-red-100 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors`}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className={`${titleFont.className} text-2xl uppercase tracking-wide text-[#15161b] mb-2`}>
                Delete Account?
              </h3>
              <p className={`${textFont.className} text-gray-400 text-sm mb-8 leading-relaxed`}>
                This action cannot be undone. Your account and all associated data will be permanently removed. You will be logged out immediately.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`${textFont.className} flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className={`${textFont.className} flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
