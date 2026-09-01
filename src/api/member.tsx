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


// Delete member and associated savings
export async function deleteMember(id: number) {
  // First delete associated savings to avoid foreign key constraints
  const { error: savingsError } = await supabase
    .from("saving")
    .delete()
    .eq("member_id", id);

  if (savingsError) {
    throw savingsError;
  }

  const { error: memberError } = await supabase
    .from("members")
    .delete()
    .eq("id", id);

  if (memberError) {
    throw memberError;
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