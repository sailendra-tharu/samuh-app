import { supabase } from "@/lib/supabase";

export interface Saving {
  id?: number;
  memberId: number | null;
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
  member_id: number | null;
  name: string;
  date: string;
  description: string | null;
  fine_in: number | string | null;
  fine_out: number | string | null;
  payment_received: number | string | null;
  created_at: string | null;
}): Saving => ({
  id: saving.id,
  memberId: saving.member_id,
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

const validateFineAmounts = (fineIn: number | null, fineOut: number | null) => {
  const assessedFine = fineIn === null ? 0 : Math.max(0, fineIn);
  const paidFine = fineOut === null ? 0 : Math.max(0, fineOut);

  if (!Number.isInteger(assessedFine) || !Number.isInteger(paidFine)) {
    throw new Error("Fine amounts must be whole numbers.");
  }

  if (paidFine > assessedFine) {
    throw new Error("Fine Out cannot be greater than Fine In.");
  }
};

export async function getSavings() {
  const { data, error } = await supabase
    .from("saving")
    .select("*")
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map(toSaving);
}

export async function getSavingsByMemberId(
  memberId: number,
  memberName?: string
) {
  const memberSavingsQuery = supabase
    .from("saving")
    .select("*")
    .eq("member_id", memberId);

  const legacySavingsQuery = memberName
    ? supabase
        .from("saving")
        .select("*")
        .is("member_id", null)
        .ilike("name", memberName.trim())
    : null;

  const [memberSavingsResult, legacySavingsResult] = await Promise.all([
    memberSavingsQuery,
    legacySavingsQuery,
  ]);

  if (memberSavingsResult.error) throw memberSavingsResult.error;
  if (legacySavingsResult?.error) throw legacySavingsResult.error;

  const savingsById = new Map<number, Saving>();

  [...memberSavingsResult.data, ...(legacySavingsResult?.data ?? [])]
    .map(toSaving)
    .forEach((saving) => {
      if (saving.id !== undefined) {
        savingsById.set(saving.id, saving);
      }
    });

  return Array.from(savingsById.values()).sort((a, b) => {
    const dateOrder = b.date.localeCompare(a.date);
    return dateOrder || (b.id ?? 0) - (a.id ?? 0);
  });
}

async function resolveMember(saving: Saving) {
  if (saving.memberId !== null) {
    const { data, error } = await supabase
      .from("members")
      .select("id, name")
      .eq("id", saving.memberId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error("The selected member no longer exists.");
    }

    return data;
  }

  const memberName = saving.name.trim();

  if (!memberName) {
    throw new Error("Member name is required for this saving.");
  }

  const { data, error } = await supabase
    .from("members")
    .select("id, name")
    .ilike("name", memberName)
    .limit(2);

  if (error) throw error;

  if (data.length === 0) {
    throw new Error(
      `No registered member found with the name "${memberName}".`
    );
  }

  if (data.length > 1) {
    throw new Error(
      `More than one member has the name "${memberName}". Please use a unique name.`
    );
  }

  return data[0];
}

export async function createSaving(saving: Saving) {
  const member = await resolveMember(saving);
  validateFineAmounts(saving.fineIn, saving.fineOut);

  const { data, error } = await supabase
    .from("saving")
    .insert({
      member_id: member.id,
      name: member.name,
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

  const member = await resolveMember(saving);
  validateFineAmounts(saving.fineIn, saving.fineOut);

  const { data, error } = await supabase
    .from("saving")
    .update({
      member_id: member.id,
      name: member.name,
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
