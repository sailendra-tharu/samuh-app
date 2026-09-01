import { supabase } from "@/lib/supabase";

export interface Member {
  id?: number;
  name: string;
  email: string;
  phone: string;
  group: string;
  joinDate: string;
}


// Get all members
export async function getMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    group: member.group,
    joinDate: member.join_date,
  }));
}


// Create member
export async function createMember(member: Member) {
  const { data, error } = await supabase
    .from("members")
    .insert({
      name: member.name,
      email: member.email,
      phone: member.phone,
      group: member.group,
      join_date: member.joinDate,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    group: data.group,
    joinDate: data.join_date,
  };
}


// Update member
export async function updateMember(member: Member) {
  const { data, error } = await supabase
    .from("members")
    .update({
      name: member.name,
      email: member.email,
      phone: member.phone,
      group: member.group,
      join_date: member.joinDate,
    })
    .eq("id", member.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    group: data.group,
    joinDate: data.join_date,
  };
}


// Delete a member without deleting historical savings.
export async function deleteMember(id: number) {
  // Loans are retained as history and currently require their member.
  // Refuse the deletion rather than relying on unknown FK cascade behavior.
  const { data: linkedLoans, error: loansError } = await supabase
    .from("loans")
    .select("id")
    .eq("member_id", id)
    .limit(1);

  if (loansError) {
    throw loansError;
  }

  if (linkedLoans.length > 0) {
    throw new Error(
      "This member cannot be deleted while loan history is linked to them."
    );
  }

  // Keep savings history by detaching it from the member before deletion.
  // member_id is nullable because legacy name-only savings are supported.
  const { error: savingsError } = await supabase
    .from("saving")
    .update({ member_id: null })
    .eq("member_id", id);

  if (savingsError) {
    throw savingsError;
  }

  const { data: deletedMember, error: memberError } = await supabase
    .from("members")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (!deletedMember) {
    throw new Error("The selected member no longer exists.");
  }
}


// Search members by query
export async function searchMembers(query: string) {
  if (!query.trim()) {
    return getMembers();
  }

  const searchQuery = `%${query}%`;

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .or(
      `name.ilike.${searchQuery},email.ilike.${searchQuery},phone.ilike.${searchQuery},group.ilike.${searchQuery}`
    )
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    group: member.group,
    joinDate: member.join_date,
  }));
}
