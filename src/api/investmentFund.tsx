import { supabase } from "@/lib/supabase";

export interface InvestmentFundIssue {
  id?: number;
  amount: number;
  issueDate: string;
  description: string;
}

type RawInvestmentFundIssue = {
  id: number;
  amount: number | string;
  issue_date: string;
  description: string | null;
};

const toInvestmentFundIssue = (
  issue: RawInvestmentFundIssue
): InvestmentFundIssue => ({
  id: issue.id,
  amount: Number(issue.amount),
  issueDate: issue.issue_date,
  description: issue.description ?? "",
});

const validateInvestmentFundIssue = (issue: InvestmentFundIssue) => {
  if (!Number.isFinite(issue.amount) || issue.amount <= 0) {
    throw new Error("Issued fund amount must be greater than zero.");
  }

  if (!issue.issueDate) {
    throw new Error("Issue date is required.");
  }
};

export async function getInvestmentFundIssues() {
  const { data, error } = await supabase
    .from("investment_fund_issues")
    .select("*")
    .order("issue_date", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map(toInvestmentFundIssue);
}

export async function createInvestmentFundIssue(issue: InvestmentFundIssue) {
  validateInvestmentFundIssue(issue);

  const { data, error } = await supabase
    .from("investment_fund_issues")
    .insert({
      amount: issue.amount,
      issue_date: issue.issueDate,
      description: issue.description.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  return toInvestmentFundIssue(data);
}

export async function updateInvestmentFundIssue(issue: InvestmentFundIssue) {
  if (issue.id === undefined) {
    throw new Error("Investment fund issue id is required for an update.");
  }

  validateInvestmentFundIssue(issue);

  const { data, error } = await supabase
    .from("investment_fund_issues")
    .update({
      amount: issue.amount,
      issue_date: issue.issueDate,
      description: issue.description.trim(),
    })
    .eq("id", issue.id)
    .select()
    .single();

  if (error) throw error;

  return toInvestmentFundIssue(data);
}

export async function deleteInvestmentFundIssue(id: number) {
  const { error } = await supabase
    .from("investment_fund_issues")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
