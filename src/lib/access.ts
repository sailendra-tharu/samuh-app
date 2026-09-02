import type { User } from "@supabase/supabase-js";

export const sectionDefinitions = [
  {
    key: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    description: "Group totals, recent activity, and financial summaries.",
  },
  {
    key: "members",
    name: "Members",
    path: "/members",
    description: "The member directory and member records.",
  },
  {
    key: "savings",
    name: "Savings",
    path: "/savings",
    description: "Savings contributions and member saving details.",
  },
  {
    key: "loans",
    name: "Loans",
    path: "/loans",
    description: "Loans, repayments, and outstanding balances.",
  },
  {
    key: "investment",
    name: "Investment",
    path: "/investment",
    description: "Group investments and current returns.",
  },
  {
    key: "profit-loss",
    name: "Profit & Loss",
    path: "/profit-loss",
    description: "Monthly profit and loss reports.",
  },
] as const;

export type SectionKey = (typeof sectionDefinitions)[number]["key"];
export type UserRole = "admin" | "member";

export type SectionPermission = {
  canView: boolean;
  canWrite: boolean;
};

export type MemberSectionPermissions = Record<SectionKey, SectionPermission>;

export const defaultMemberSectionPermissions: MemberSectionPermissions = {
  dashboard: { canView: true, canWrite: false },
  members: { canView: true, canWrite: false },
  savings: { canView: true, canWrite: false },
  loans: { canView: true, canWrite: false },
  investment: { canView: true, canWrite: false },
  "profit-loss": { canView: true, canWrite: false },
};

export const noMemberSectionPermissions: MemberSectionPermissions = {
  dashboard: { canView: false, canWrite: false },
  members: { canView: false, canWrite: false },
  savings: { canView: false, canWrite: false },
  loans: { canView: false, canWrite: false },
  investment: { canView: false, canWrite: false },
  "profit-loss": { canView: false, canWrite: false },
};

export const isSectionKey = (value: string): value is SectionKey =>
  sectionDefinitions.some((section) => section.key === value);

export function getMetadataRole(user: User | null): UserRole {
  const role = String(user?.app_metadata?.role ?? "").toLowerCase();

  return role === "admin" || role === "super_admin" ? "admin" : "member";
}

