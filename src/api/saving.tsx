import { supabase } from "@/lib/supabase";

export interface Saving {
  id?: number;
  name: string;
  date: string;
  description: string;
  fineIn: number | null;
  fineOut: number | null;
  paymentReceived: number | null;
  createdAt?: string;
}

const toSaving = (saving: {
  id: number;
  name: string;
  date: string;
  description: string | null;
  fine_in: number | string | null;
  fine_out: number | string | null;
  payment_received: number | string | null;
  created_at: string | null;
}): Saving => ({
  id: saving.id,
  name: saving.name,
  date: saving.date,
  description: saving.description ?? "",
  fineIn: saving.fine_in === null ? null : Number(saving.fine_in),
  fineOut: saving.fine_out === null ? null : Number(saving.fine_out),
  paymentReceived:
    saving.payment_received === null
      ? null
      : Number(saving.payment_received),
  createdAt: saving.created_at ?? undefined,
});

export async function getSavings() {
  const { data, error } = await supabase
    .from("saving")
    .select("*")
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map(toSaving);
}

export async function createSaving(saving: Saving) {
  const { data, error } = await supabase
    .from("saving")
    .insert({
      name: saving.name,
      date: saving.date,
      description: saving.description || null,
      fine_in: saving.fineIn,
      fine_out: saving.fineOut,
      payment_received: saving.paymentReceived,
    })
    .select()
    .single();

  if (error) throw error;

  return toSaving(data);
}

export async function updateSaving(saving: Saving) {
  if (saving.id === undefined) {
    throw new Error("Saving id is required to update a saving.");
  }

  const { data, error } = await supabase
    .from("saving")
    .update({
      name: saving.name,
      date: saving.date,
      description: saving.description || null,
      fine_in: saving.fineIn,
      fine_out: saving.fineOut,
      payment_received: saving.paymentReceived,
    })
    .eq("id", saving.id)
    .select()
    .single();

  if (error) throw error;

  return toSaving(data);
}

export async function deleteSaving(id: number) {
  const { error } = await supabase
    .from("saving")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function searchSavings(query: string) {
  if (!query.trim()) return getSavings();

  const searchQuery = `%${query.trim()}%`;
  const { data, error } = await supabase
    .from("saving")
    .select("*")
    .or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`)
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map(toSaving);
}
