import { connectDB } from "@/lib/db";
import { Address } from "@/models/Address";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

export async function getAddresses() {
  const session = await getSession();
  try {
    if (!session?.user) return [];

    await connectDB();
    const addresses = await Address.find({ userId: session.user.id }).lean();

    return JSON.parse(JSON.stringify(addresses));
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return [];
  }
}
