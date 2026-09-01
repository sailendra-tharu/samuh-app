import { supabase } from "@/lib/supabase";

export type InvestmentStatus = "active" | "completed" | "sold";

export interface Investment {
  id?: string;
  name: string;
  type: string;
  investedAmount: number | null;
  currentValue: number | null;
  returnValue: number;
  status: InvestmentStatus;
}

type RawInvestment = {
  id: string;
  name: string;
  type: string;
  invested_amount: number | string | null;
  current_value: number | string | null;
  return_value: number | string | null;
  status: string | null;
};

const toNumberOrNull = (value: number | string | null | undefined) =>
  value === null || value === undefined ? null : Number(value);

const toStatus = (value: string | null): InvestmentStatus => {
  if (value === "completed" || value === "sold") return value;

  return "active";
};

const toInvestment = (investment: RawInvestment): Investment => ({
  id: investment.id,
  name: investment.name,
  type: investment.type,
  investedAmount: toNumberOrNull(investment.invested_amount),
  currentValue: toNumberOrNull(investment.current_value),
  returnValue: toNumberOrNull(investment.return_value) ?? 0,
  status: toStatus(investment.status),
});

const validateInvestment = (investment: Investment) => {
  if (!investment.name.trim()) {
    throw new Error("Investment name is required.");
  }

  if (!investment.type.trim()) {
    throw new Error("Investment type is required.");
  }

  if (
    investment.investedAmount === null ||
    !Number.isFinite(investment.investedAmount) ||
    investment.investedAmount < 0
  ) {
    throw new Error("Invested amount must be a valid non-negative number.");
  }

  if (
    investment.currentValue === null ||
    !Number.isFinite(investment.currentValue) ||
    investment.currentValue < 0
  ) {
    throw new Error("Current value must be a valid non-negative number.");
  }

  if (
    !Number.isInteger(investment.returnValue) ||
    investment.returnValue < 0
  ) {
    throw new Error("Return value must be a valid non-negative whole number.");
  }
};

export async function getInvestments() {
  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  return data.map(toInvestment);
}

export async function createInvestment(investment: Investment) {
  validateInvestment(investment);

  const { data, error } = await supabase
    .from("investments")
    .insert({
      name: investment.name.trim(),
      type: investment.type.trim(),
      invested_amount: investment.investedAmount,
      current_value: investment.currentValue,
      return_value: investment.returnValue,
      status: investment.status,
    })
    .select()
    .single();

  if (error) throw error;

  return toInvestment(data);
}

export async function updateInvestment(investment: Investment) {
  if (investment.id === undefined) {
    throw new Error("Investment id is required to update an investment.");
  }

  validateInvestment(investment);

  const { data, error } = await supabase
    .from("investments")
    .update({
      name: investment.name.trim(),
      type: investment.type.trim(),
      invested_amount: investment.investedAmount,
      current_value: investment.currentValue,
      return_value: investment.returnValue,
      status: investment.status,
    })
    .eq("id", investment.id)
    .select()
    .single();

  if (error) throw error;

  return toInvestment(data);
}

export async function deleteInvestment(id: string) {
  const { error } = await supabase
    .from("investments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function searchInvestments(query: string) {
  if (!query.trim()) return getInvestments();

  const searchQuery = `%${query.trim()}%`;
  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .or(`name.ilike.${searchQuery},type.ilike.${searchQuery}`)
    .order("name", { ascending: true });

  if (error) throw error;

  return data.map(toInvestment);
}
