'use server';

export async function verifyAdminPasskey(key: string): Promise<{ success: boolean; error?: string }> {
  if (!key || !key.trim()) {
    return { success: false, error: "Please enter the admin passkey." };
  }

  const correct = process.env.ADMIN_PASSKEY;
  if (!correct) {
    console.error("ADMIN_PASSKEY is not set in environment variables.");
    return { success: false, error: "Server configuration error: Admin passkey is not configured." };
  }

  if (key.trim() !== correct.trim()) {
    return { success: false, error: "Invalid passkey. Please check and try again." };
  }

  return { success: true };
}
