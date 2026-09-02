import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/access";

type ProfileRow = {
  role: string;
};

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  const role = (data as ProfileRow).role.toLowerCase();

  return role === "admin" ? "admin" : "member";
}

