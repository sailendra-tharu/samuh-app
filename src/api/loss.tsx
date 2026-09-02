import { supabase } from "@/lib/supabase";

export interface LossEntry {
  id?: number;
  lossDate: string;
  category: string;
  amount: number;
  details: string;
}

const toLossEntry = (entry: {
  id: number;
  loss_date: string;
  category: string;
  amount: number | string;
  details: string | null;
}): LossEntry => ({
  id: entry.id,
  lossDate: entry.loss_date,
  category: entry.category,
  amount: Number(entry.amount),
  details: entry.details ?? "",
});

export async function getLossEntries() {
  const { data, error } = await supabase
    .from("loss_entries")
    .select("*")
    .order("loss_date", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map(toLossEntry);
}

export async function createLossEntry(entry: LossEntry) {
  const { data, error } = await supabase
    .from("loss_entries")
    .insert({
      loss_date: entry.lossDate,
      category: entry.category || "Monthly Loss",
      amount: entry.amount,
      details: entry.details || null,
    })
    .select()
    .single();

  if (error) throw error;

  return toLossEntry(data);
}

export async function updateLossEntry(entry: LossEntry) {
  if (entry.id === undefined) {
    throw new Error("Loss entry id is required to update a loss.");
  }

  const { data, error } = await supabase
    .from("loss_entries")
    .update({
      loss_date: entry.lossDate,
      category: entry.category || "Monthly Loss",
      amount: entry.amount,
      details: entry.details || null,
    })
    .eq("id", entry.id)
    .select()
    .single();

  if (error) throw error;

  return toLossEntry(data);
}

export async function deleteLossEntry(id: number) {
  const { error } = await supabase
    .from("loss_entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
