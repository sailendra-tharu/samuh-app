import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  HandCoins,
  Plus,
  ReceiptText,
  UserRoundPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import NepaliDate from "nepali-date-converter";
import { useNavigate } from "react-router-dom";

import type { Loan } from "@/api/loan";
import type { Saving } from "@/api/saving";
import { useLoans } from "@/hook/loan";
import { useMembers } from "@/hook/member";
import { useSavings } from "@/hook/saving";

const money = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => `Rs ${money.format(Math.round(value))}`;

const formatCompactCurrency = (value: number) => {
  if (value >= 10_000_000) return `Rs ${(value / 10_000_000).toFixed(1)} Cr`;
  if (value >= 100_000) return `Rs ${(value / 100_000).toFixed(1)} L`;
  if (value >= 1_000) return `Rs ${(value / 1_000).toFixed(1)}K`;

  return formatCurrency(value);
};

const parseDate = (value: string) => {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string) => {
  const date = parseDate(value);

  return date
    ? date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : value;
};

const bsMonthNames = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Aswin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const getLastSixMonths = (year: number, month: number) => {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new NepaliDate(year, month, 1);
    date.setMonth(month - 5 + index);

    return {
      key: date.format("YYYY-MM"),
      label: date.format("MMM"),
    };
  });
};

const monthOptions = bsMonthNames.map((label, value) => ({ value, label }));

const getBSDate = (value: string) => {
  const date = parseDate(value);

  if (!date) return null;

  try {
    return new NepaliDate(date);
  } catch {
    return null;
  }
};

const getBSMonthKey = (value: string) => getBSDate(value)?.format("YYYY-MM");

type ActivityItem = {
  id: string;
  type: "saving" | "loan";
  name: string;
  date: string;
  amount: number;
};

const getActivityItems = (savings: Saving[], loans: Loan[]) => {
  const savingActivity: ActivityItem[] = savings.map((saving) => ({
    id: `saving-${saving.id ?? saving.date}-${saving.name}`,
    type: "saving",
    name: saving.name,
    date: saving.date,
    amount: saving.paymentReceived ?? 0,
  }));

  const loanActivity: ActivityItem[] = loans.map((loan) => ({
    id: `loan-${loan.id ?? loan.loanDate}-${loan.name}`,
    type: "loan",
    name: loan.name || "Unknown member",
    date: loan.loanDate,
    amount: loan.principalAmount ?? 0,
  }));

  return [...savingActivity, ...loanActivity]
    .sort((first, second) => {
      const firstDate = parseDate(first.date)?.getTime() ?? 0;
      const secondDate = parseDate(second.date)?.getTime() ?? 0;

      return secondDate - firstDate;
    })
    .slice(0, 5);
};

function Dashboard() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => NepaliDate.now().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => NepaliDate.now().getYear());
  const { members, isLoading: membersLoading } = useMembers();
  const { savings, isLoading: savingsLoading } = useSavings();
  const { loans, isLoading: loansLoading, error: loansError } = useLoans();

  const isLoading = membersLoading || savingsLoading || loansLoading;
  const totalSavings = savings.reduce(
    (total, saving) => total + (saving.paymentReceived ?? 0),
    0
  );
  const savingsThisMonth = savings.reduce((total, saving) => {
    const currentBS = NepaliDate.now();

    return getBSMonthKey(saving.date) === currentBS.format("YYYY-MM")
      ? total + (saving.paymentReceived ?? 0)
      : total;
  }, 0);
  const totalLoanPrincipal = loans.reduce(
    (total, loan) => total + (loan.principalAmount ?? 0),
    0
  );
  const paidPrincipal = loans.reduce((total, loan) => total + loan.paidAmount, 0);
  const outstandingPrincipal = loans.reduce(
    (total, loan) => total + (loan.remainingPrincipal ?? 0),
    0
  );
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const paidLoans = loans.filter((loan) => loan.status === "paid");
  const collectionRate = totalLoanPrincipal
    ? Math.min(100, Math.round((paidPrincipal / totalLoanPrincipal) * 100))
    : 0;
  const monthData = getLastSixMonths(selectedYear, selectedMonth).map((month) => ({
    ...month,
    total: savings.reduce((total, saving) => {
      return getBSMonthKey(saving.date) === month.key
        ? total + (saving.paymentReceived ?? 0)
        : total;
    }, 0),
  }));
  const maxMonthTotal = Math.max(...monthData.map((month) => month.total), 1);
  const selectedMonthTotal = monthData[monthData.length - 1]?.total ?? 0;
  const currentBS = NepaliDate.now();
  const isCurrentPeriod =
    selectedMonth === currentBS.getMonth() && selectedYear === currentBS.getYear();
  const availableYears = Array.from(
    new Set([
      currentBS.getYear(),
      ...savings.flatMap((saving) => {
        const date = getBSDate(saving.date);

        return date ? [date.getYear()] : [];
      }),
    ])
  ).sort((first, second) => second - first);
  const activityItems = getActivityItems(savings, loans);
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : currentHour < 21
          ? "Good evening"
          : "Good night";

  const statCards = [
    {
      label: "Total members",
      value: members.length.toLocaleString(),
      detail: "Registered in your group",
      icon: Users,
      iconClass: "bg-[#e7f7ef] text-[#09815a]",
      accent: "#09815a",
    },
    {
      label: "Total savings",
      value: formatCompactCurrency(totalSavings),
      detail: `${formatCurrency(savingsThisMonth)} collected this month`,
      icon: Wallet,
      iconClass: "bg-[#fff4da] text-[#bf7b08]",
      accent: "#bf7b08",
    },
    {
      label: "Active loans",
      value: activeLoans.length.toLocaleString(),
      detail: `${paidLoans.length} loan${paidLoans.length === 1 ? "" : "s"} fully paid`,
      icon: HandCoins,
      iconClass: "bg-[#eeeaff] text-[#6853c8]",
      accent: "#6853c8",
    },
    {
      label: "Outstanding balance",
      value: formatCompactCurrency(outstandingPrincipal),
      detail: "Principal remaining to collect",
      icon: CircleDollarSign,
      iconClass: "bg-[#e8f3ff] text-[#3679c9]",
      accent: "#3679c9",
    },
  ] as const;

  const quickActions = [
    {
      label: "Add a member",
      description: "Register someone new",
      icon: UserRoundPlus,
      path: "/members",
      className: "bg-[#e9f8f0] text-[#087b55]",
    },
    {
      label: "Record saving",
      description: "Add a new contribution",
      icon: ReceiptText,
      path: "/savings",
      className: "bg-[#fff5dc] text-[#b47709]",
    },
    {
      label: "Issue a loan",
      description: "Create a loan record",
      icon: CreditCard,
      path: "/loans",
      className: "bg-[#eeebff] text-[#6651c3]",
    },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#103f34] px-6 py-7 text-white shadow-[0_18px_45px_-24px_rgba(16,63,52,0.8)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5de0a4]" />
              Group overview
            </div>
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {greeting}, Admin
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/75 sm:text-base">
              Keep your community moving forward with a clear view of every
              contribution and loan.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="flex items-center gap-2 text-sm text-emerald-100/75">
              <CalendarDays className="h-4 w-4" />
              {todayLabel}
            </div>
          </div>
        </div>

        <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border-[30px] border-white/5" />
        <div className="absolute -bottom-36 right-24 h-72 w-72 rounded-full border-[30px] border-[#5de0a4]/10" />
        <div className="absolute bottom-0 left-1/2 h-px w-1/3 bg-white/10" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(15,23,42,0.5)]"
              style={{ borderTopColor: stat.accent, borderTopWidth: 3 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-[27px] font-semibold tracking-[-0.04em] text-slate-900">
                    {isLoading ? "—" : stat.value}
                  </p>
                </div>
                <span className={`rounded-xl p-3 ${stat.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 truncate text-xs text-slate-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900">Savings overview</p>
              <p className="mt-1 text-sm text-slate-500">
                Contributions collected over a six-month BS window
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <label className="sr-only" htmlFor="savings-month-filter">Savings month</label>
                <select
                  id="savings-month-filter"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(Number(event.target.value))}
                  className="cursor-pointer bg-transparent text-xs font-medium text-slate-700 outline-none"
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="savings-year-filter">Savings year</label>
                <select
                  id="savings-year-filter"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="cursor-pointer bg-transparent text-xs font-medium text-slate-700 outline-none"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg bg-[#e9f8f0] px-3 py-2 text-right">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#14825e]">
                  {isCurrentPeriod ? "This month" : "Selected month"}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#07583e]">
                  {isLoading ? "—" : formatCurrency(selectedMonthTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex h-52 items-end gap-2 sm:gap-4">
            {monthData.map((month, index) => {
              const height = month.total
                ? Math.max(12, Math.round((month.total / maxMonthTotal) * 100))
                : 5;
              const isCurrentMonth = index === monthData.length - 1;

              return (
                <div key={month.key} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
                  <div className="group relative flex h-full w-full items-end justify-center">
                    <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                      {formatCurrency(month.total)}
                    </div>
                    <div
                      className={`w-full max-w-12 rounded-t-lg transition-all duration-500 ${
                        isCurrentMonth
                          ? "bg-[#087b55] shadow-[0_8px_16px_-8px_rgba(8,123,85,0.7)]"
                          : "bg-[#b9e5d1] group-hover:bg-[#82d1ac]"
                      }`}
                      style={{ height: `${isLoading ? 5 : height}%` }}
                    />
                  </div>
                  <span className={`text-xs ${isCurrentMonth ? "font-semibold text-[#087b55]" : "text-slate-400"}`}>
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Loan health</p>
              <p className="mt-1 text-sm text-slate-500">Your group’s repayment picture</p>
            </div>
            <span className="rounded-lg bg-[#eeebff] p-2.5 text-[#6651c3]">
              <BriefcaseBusiness className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-7 flex items-center gap-5">
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#6b57ce ${collectionRate}%, #eeeaff ${collectionRate}% 100%)` }}>
              <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">{isLoading ? "—" : `${collectionRate}%`}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">collected</p>
                </div>
              </div>
            </div>
            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-[#6b57ce]" />Paid principal</span>
                <span className="font-semibold text-slate-800">{isLoading ? "—" : formatCompactCurrency(paidPrincipal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-200" />Outstanding</span>
                <span className="font-semibold text-slate-800">{isLoading ? "—" : formatCompactCurrency(outstandingPrincipal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
            <div>
              <p className="text-xs text-slate-500">Total issued</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{isLoading ? "—" : formatCompactCurrency(totalLoanPrincipal)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Active loans</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{isLoading ? "—" : activeLoans.length}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <p className="text-base font-semibold text-slate-900">Recent activity</p>
              <p className="mt-1 text-sm text-slate-500">The latest movement in your group</p>
            </div>
            <Activity className="h-5 w-5 text-slate-300" />
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">Loading recent activity…</div>
            ) : activityItems.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">No activity recorded yet.</div>
            ) : (
              activityItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.type === "saving" ? "/savings" : "/loans")}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.type === "saving" ? "bg-[#e9f8f0] text-[#087b55]" : "bg-[#eeebff] text-[#6651c3]"}`}>
                    {item.type === "saving" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{item.type === "saving" ? "Saving recorded" : "Loan issued"}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{item.name} · {formatDate(item.date)}</span>
                  </span>
                  <span className={`shrink-0 text-sm font-semibold ${item.type === "saving" ? "text-[#087b55]" : "text-[#6651c3]"}`}>
                    {item.type === "saving" ? "+" : ""}{formatCurrency(item.amount)}
                  </span>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                </button>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-slate-900">Quick actions</p>
              <p className="mt-1 text-sm text-slate-500">Common tasks, one click away</p>
            </div>
            <Plus className="h-5 w-5 text-slate-300" />
          </div>

          <div className="mt-6 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${action.className}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">{action.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{action.description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-[#f7faf9] p-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-[#dff4e8] p-2 text-[#087b55]"><CheckCircle2 className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Stay on top of repayments</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Review active loans regularly to keep every member on track.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {loansError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Clock3 className="h-4 w-4 shrink-0" />
          Some loan information could not be loaded. Other dashboard data is still available.
        </div>
      )}
    </div>
  );
}

export default Dashboard;
