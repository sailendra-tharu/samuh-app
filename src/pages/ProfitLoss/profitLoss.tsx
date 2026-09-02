import { useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import NepaliDate from "nepali-date-converter";

import { getInvestmentGainOrLoss } from "@/api/investment";
import type { Loan } from "@/api/loan";
import type { LossEntry } from "@/api/loss";
import type { Saving } from "@/api/saving";
import Pagination from "@/component/Pagination/pagination";
import { useInvestments } from "@/hook/investment";
import { useLossEntries } from "@/hook/loss";
import { useLoans } from "@/hook/loan";
import { useSavings } from "@/hook/saving";
import { useSectionAccess } from "@/hook/access";

type ProfitRow = {
  id: string;
  category: string;
  amount: number;
  details: string;
};

type DetailRow = ProfitRow & {
  type: "Profit" | "Loss";
  lossId?: number;
};

type MonthlySummary = {
  key: string;
  label: string;
  fineIn: number;
  fineOut: number;
  newMember: number;
  renewal: number;
  interest: number;
  investmentGainOrLoss: number;
  profit: number;
  loss: number;
  net: number;
  totalCollections: number;
};

const getMonthlyDescription = (row: MonthlySummary) => {
  const profitSources: string[] = [];
  const lossSources: string[] = [];

  if (row.fineOut > 0) profitSources.push("Fine Out");
  if (row.newMember > 0) profitSources.push("New Member");
  if (row.renewal > 0) profitSources.push("Renewal Paid");
  if (row.interest > 0) profitSources.push("Interest");
  if (row.investmentGainOrLoss !== 0) {
    profitSources.push("Investment Gain / Loss");
  }
  if (row.loss > 0) lossSources.push("Manual Loss");

  return {
    profit: profitSources.length > 0 ? profitSources.join(", ") : "None",
    loss: lossSources.length > 0 ? lossSources.join(", ") : "None",
  };
};

const money = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => `Rs ${money.format(Math.round(value))}`;

const toAmount = (value: number | string | null | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  if (typeof value !== "string" || !value.trim()) return 0;

  const amount = Number(value.replace(/,/g, "").trim());

  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

const getBSMonthKey = (value: string) => {
  if (!value) return null;

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);

  if (Number.isNaN(date.getTime())) return null;

  try {
    return new NepaliDate(date).format("YYYY-MM");
  } catch {
    return null;
  }
};

const getMonthOptions = (year: number) => {
  return Array.from({ length: 12 }, (_, month) => {
    const date = new NepaliDate(year, month, 1);

    return {
      value: month,
      key: date.format("YYYY-MM"),
      label: date.format("MMMM"),
    };
  });
};

const getYearOptions = (currentYear: number) =>
  Array.from({ length: 10 }, (_, index) => currentYear - index);

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLossDateForMonth = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);

  return formatLocalDate(new NepaliDate(year, month - 1, 1).toJsDate());
};

const getSavingProfit = (savings: Saving[], selectedMonth: string) => {
  const monthSavings = savings.filter(
    (saving) => getBSMonthKey(saving.date) === selectedMonth
  );

  return {
    paymentReceived: monthSavings.reduce(
      (total, saving) => total + toAmount(saving.paymentReceived),
      0
    ),
    fineIn: monthSavings.reduce((total, saving) => total + toAmount(saving.fineIn), 0),
    fineOut: monthSavings.reduce((total, saving) => total + toAmount(saving.fineOut), 0),
    newMember: monthSavings.reduce((total, saving) => total + toAmount(saving.newMember), 0),
  };
};

const getLoanProfit = (loans: Loan[], selectedMonth: string) => {
  const monthLoans = loans.filter((loan) => getBSMonthKey(loan.loanDate) === selectedMonth);
  const fineOut = loans.reduce((total, loan) => {
    const paymentFineOut = loan.payments.reduce(
      (paymentTotal, payment) =>
        getBSMonthKey(payment.paymentDate) === selectedMonth
          ? paymentTotal + toAmount(payment.finePaid)
          : paymentTotal,
      0
    );
    const recordedFineOut = toAmount(loan.fineOut);
    const allPaymentFineOut = loan.payments.reduce(
      (paymentTotal, payment) => paymentTotal + toAmount(payment.finePaid),
      0
    );
    const initialFineOut =
      getBSMonthKey(loan.loanDate) === selectedMonth
        ? Math.max(recordedFineOut - allPaymentFineOut, 0)
        : 0;

    return total + initialFineOut + paymentFineOut;
  }, 0);
  const renewal = loans.reduce(
    (total, loan) =>
      total +
      loan.payments.reduce(
        (paymentTotal, payment) =>
          getBSMonthKey(payment.paymentDate) === selectedMonth
            ? paymentTotal + toAmount(payment.renewalPaid)
            : paymentTotal,
        0
      ),
    0
  );
  const renewalWithoutPaymentHistory = monthLoans.reduce((total, loan) => {
    const allPaymentRenewal = loan.payments.reduce(
      (paymentTotal, payment) => paymentTotal + toAmount(payment.renewalPaid),
      0
    );

    return total + Math.max(toAmount(loan.renewalPaid) - allPaymentRenewal, 0);
  }, 0);
  const interest = loans.reduce(
    (total, loan) =>
      total +
      loan.payments.reduce(
        (paymentTotal, payment) =>
          getBSMonthKey(payment.paymentDate) === selectedMonth
            ? paymentTotal + toAmount(payment.interestPaid)
            : paymentTotal,
        0
      ),
    0
  );
  const principalCollected = loans.reduce(
    (total, loan) =>
      total +
      loan.payments.reduce(
        (paymentTotal, payment) =>
          getBSMonthKey(payment.paymentDate) === selectedMonth
            ? paymentTotal + toAmount(payment.amount)
            : paymentTotal,
        0
      ),
      0
  );
  const principalIssued = monthLoans.reduce(
    (total, loan) => total + toAmount(loan.principalAmount),
    0
  );

  return {
    fineOut,
    renewal: renewal + renewalWithoutPaymentHistory,
    interest,
    principalCollected,
    principalIssued,
  };
};

function ProfitLoss() {
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const yearOptions = getYearOptions(currentYear);
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [overviewPage, setOverviewPage] = useState(1);
  const [detailsPage, setDetailsPage] = useState(1);
  const pageSize = 10;
  const { canWrite } = useSectionAccess();
  const canWriteProfitLoss = canWrite("profit-loss");
  const { savings, isLoading: savingsLoading } = useSavings();
  const { loans, isLoading: loansLoading, error: loansError } = useLoans();
  const {
    investments,
    isLoading: investmentsLoading,
    error: investmentsError,
  } = useInvestments();
  {
    /* lossEntries */
  }
  const {
    lossEntries,
    isLoading: lossLoading,
    error: lossError,
    saveLoss,
    deleteLoss,
    isSaving,
    isDeleting,
  } = useLossEntries();
  const isLoading = savingsLoading || loansLoading || investmentsLoading;
  const reportLoading = isLoading || lossLoading;

  const monthOptions = getMonthOptions(selectedYear ?? currentYear);
  const selectedMonthKey =
    selectedYear !== null && selectedMonth !== null
      ? new NepaliDate(selectedYear, selectedMonth, 1).format("YYYY-MM")
      : null;
  const currentMonthKey = currentBS.format("YYYY-MM");
  const lossMonthKey =
    selectedMonthKey ??
    (selectedYear !== null
      ? new NepaliDate(selectedYear, currentBS.getMonth(), 1).format("YYYY-MM")
      : null);
  const getInvestmentGainOrLossForMonth = (monthKey: string) => {
    if (monthKey !== currentMonthKey) return 0;

    return investments.reduce((total, investment) => {
      const gainOrLoss = getInvestmentGainOrLoss(investment);

      return gainOrLoss === null ? total : total + gainOrLoss;
    }, 0);
  };
  const getMonthlySummary = (monthKey: string): MonthlySummary => {
    const savingProfit = getSavingProfit(savings, monthKey);
    const loanProfit = getLoanProfit(loans, monthKey);
    const investmentGainOrLoss = getInvestmentGainOrLossForMonth(monthKey);
    const loss = lossEntries
      .filter((entry) => getBSMonthKey(entry.lossDate) === monthKey)
      .reduce((total, entry) => total + entry.amount, 0);
    const totalCollections =
      savingProfit.newMember +
      savingProfit.fineOut +
      savingProfit.paymentReceived +
      loanProfit.renewal +
      loanProfit.fineOut +
      loanProfit.interest +
      loanProfit.principalCollected +
      investmentGainOrLoss -
      loanProfit.principalIssued -
      loss;
    const profit =
      savingProfit.fineOut +
      savingProfit.newMember +
      loanProfit.renewal +
      loanProfit.interest +
      loanProfit.fineOut +
      investmentGainOrLoss;
    const month = monthOptions.find((option) => option.key === monthKey);

    return {
      key: monthKey,
      label: month?.label ?? monthKey,
      fineIn: savingProfit.fineIn,
      fineOut: savingProfit.fineOut + loanProfit.fineOut,
      newMember: savingProfit.newMember,
      renewal: loanProfit.renewal,
      interest: loanProfit.interest,
      investmentGainOrLoss,
      profit,
      loss,
      net: profit - loss,
      totalCollections,
    };
  };
  const emptySummary: MonthlySummary = {
    key: "",
    label: "",
    fineIn: 0,
    fineOut: 0,
    newMember: 0,
    renewal: 0,
    interest: 0,
    investmentGainOrLoss: 0,
    profit: 0,
    loss: 0,
    net: 0,
    totalCollections: 0,
  };
  const annualRows =
    selectedYear === null
      ? []
      : monthOptions.map((month) => getMonthlySummary(month.key));
  const annualInvestmentGainOrLoss = annualRows.reduce(
    (total, row) => total + row.investmentGainOrLoss,
    0
  );
  const annualProfit = annualRows.reduce((total, row) => total + row.profit, 0);
  const annualLoss = annualRows.reduce((total, row) => total + row.loss, 0);
  const annualNet = annualProfit - annualLoss;
  const annualTotalCollections = annualRows.reduce(
    (total, row) => total + row.totalCollections,
    0
  );
  const selectedSummary = selectedMonthKey
    ? getMonthlySummary(selectedMonthKey)
    : selectedYear === null
      ? emptySummary
      : {
          key: `${selectedYear}`,
          label: `${selectedYear}`,
          fineIn: annualRows.reduce((total, row) => total + row.fineIn, 0),
          fineOut: annualRows.reduce((total, row) => total + row.fineOut, 0),
          newMember: annualRows.reduce((total, row) => total + row.newMember, 0),
          renewal: annualRows.reduce((total, row) => total + row.renewal, 0),
          interest: annualRows.reduce((total, row) => total + row.interest, 0),
          investmentGainOrLoss: annualInvestmentGainOrLoss,
          profit: annualProfit,
          loss: annualLoss,
          net: annualNet,
          totalCollections: annualTotalCollections,
        };
  const selectedMonthLabel = selectedMonthKey
    ? monthOptions.find((month) => month.key === selectedMonthKey)?.label ?? selectedMonthKey
    : selectedYear
      ? `${selectedYear} - All months`
      : "Select year";
  const selectedPeriodLosses = selectedYear === null
    ? []
    : lossEntries.filter((entry) => {
        const lossMonthKey = getBSMonthKey(entry.lossDate);

        return (
          lossMonthKey !== null &&
          (selectedMonthKey
            ? lossMonthKey === selectedMonthKey
            : lossMonthKey.startsWith(`${selectedYear}-`))
        );
      });
  const monthlyLoss = selectedMonthKey
    ? selectedPeriodLosses[0]
    : undefined;
  const profitRows: ProfitRow[] = selectedYear !== null
    ? [
    {
      id: "fine-out",
      category: "Fine Out",
      amount: selectedSummary.fineOut,
      details: "Automatically calculated from savings and loan records",
    },
    {
      id: "new-member",
      category: "New Member",
      amount: selectedSummary.newMember,
      details: "Automatically calculated from savings records",
    },
    {
      id: "renewal",
      category: "Renewal",
      amount: selectedSummary.renewal,
      details: "Automatically calculated from loan records",
    },
    {
      id: "interest",
      category: "Interest",
      amount: selectedSummary.interest,
      details: "Interest amounts recorded in loan payments",
    },
    {
      id: "investment-return",
      category: "Investment Gain / Loss",
      amount: selectedSummary.investmentGainOrLoss,
      details: "Gain / Loss values from the investments table",
    },
  ]
    : [];
  const detailRows: DetailRow[] = selectedYear !== null
    ? [
        ...profitRows.map((row) => ({ ...row, type: "Profit" as const })),
        ...selectedPeriodLosses.map((lossEntry) => ({
          id: `monthly-loss-${lossEntry.id ?? lossEntry.lossDate}`,
          category: lossEntry.category || "Monthly Loss",
          type: "Loss" as const,
          amount: lossEntry.amount,
          details: lossEntry.details || "—",
          lossId: lossEntry.id,
        })),
      ]
    : [];
  const overviewPageCount = Math.max(1, Math.ceil(annualRows.length / pageSize));
  const detailsPageCount = Math.max(1, Math.ceil(detailRows.length / pageSize));
  const activeOverviewPage = Math.min(overviewPage, overviewPageCount);
  const activeDetailsPage = Math.min(detailsPage, detailsPageCount);
  const paginatedAnnualRows = annualRows.slice(
    (activeOverviewPage - 1) * pageSize,
    activeOverviewPage * pageSize
  );
  const paginatedDetailRows = detailRows.slice(
    (activeDetailsPage - 1) * pageSize,
    activeDetailsPage * pageSize
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWriteProfitLoss || !lossMonthKey) return;

    const amountValue = amount ?? (monthlyLoss ? String(monthlyLoss.amount) : "");
    const lossDetails = details ?? monthlyLoss?.details ?? "";
    const parsedAmount = Number(amountValue);

    if (!amountValue.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return;

    setActionError("");

    const existingLoss = monthlyLoss;

    try {
      await saveLoss({
        id: existingLoss?.id,
        lossDate: getLossDateForMonth(lossMonthKey),
        category: "Monthly Loss",
        amount: parsedAmount,
        details: lossDetails,
      } satisfies LossEntry);
    } catch {
      setActionError("Unable to save the monthly loss. Please try again.");
      return;
    }

    setAmount(null);
    setDetails(null);
  };

  const deleteLossEntry = async (id: number) => {
    if (!canWriteProfitLoss) return;

    setActionError("");

    try {
      await deleteLoss(id);
    } catch {
      setActionError("Unable to delete the monthly loss. Please try again.");
    }
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1480px] space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#103f34] px-4 py-5 text-white shadow-[0_18px_45px_-24px_rgba(16,63,52,0.8)] sm:rounded-[28px] sm:px-8 sm:py-8">
        <div className="relative z-10 flex items-start justify-between gap-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Profit &amp; Loss
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/75 sm:text-base">
            Monitor the overall financial performance of your investments by tracking realized gains, losses, and changes in investment value over time.
            </p>
          </div>
          <span
            aria-hidden="true"
            className="hidden h-12 w-12 items-center justify-center text-4xl font-semibold text-emerald-200/70 sm:flex"
          >
            रु
          </span>
        </div>

        <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border-[30px] border-white/5" />
      </section>

      {loansError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Loan data could not be fully loaded. The report includes the available records.
        </div>
      )}

      {lossError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Loss data could not be loaded. Check that the <code>loss_entries</code> table is available.
        </div>
      )}

      {investmentsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Investment data could not be loaded. Check that the <code>investments</code> table is available.
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-base font-semibold text-slate-900">Report period</p>
          <p className="mt-1 text-sm text-slate-500">Select a B.S. year and month.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <select
            value={selectedYear ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedYear(value ? Number(value) : null);
              setSelectedMonth(null);
              setOverviewPage(1);
              setDetailsPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#087b55] focus:ring-2 focus:ring-[#b9e5d1] sm:w-28"
            aria-label="Profit and loss report year"
          >
            <option value="">Select year</option>
            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            value={selectedMonth ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedMonth(value ? Number(value) : null);
              setDetailsPage(1);
            }}
            disabled={selectedYear === null}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#087b55] focus:ring-2 focus:ring-[#b9e5d1] sm:w-36"
            aria-label="Profit and loss report month"
          >
            <option value="">Select month</option>
            {monthOptions.map((month) => (
              <option key={month.key} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-emerald-700">profit</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-emerald-700">
            {selectedYear === null ? "Select period" : isLoading ? "—" : formatCurrency(selectedSummary.profit)}
          </p>
        </article>

        <article className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-red-700">Loss</p>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-red-700">
            {selectedYear === null ? "Select period" : reportLoading ? "—" : formatCurrency(selectedSummary.loss)}
          </p>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-amber-700">Total Collections</p>
            <Wallet className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-amber-700">
            {selectedYear === null
              ? "Select period"
              : reportLoading
                ? "—"
                : formatCurrency(selectedSummary.totalCollections)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            After loan disbursements and recorded losses
          </p>
        </article>

      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <p className="text-base font-semibold text-slate-900">{selectedYear ?? "Select year"} monthly overview</p>
          <p className="mt-1 text-sm text-slate-500">profit and loss for every month of the selected year.</p>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-[1140px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Month</th>
                <th className="min-w-[320px] px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 text-right font-medium">Fine In</th>
                <th className="px-5 py-3 text-right font-medium">Fine Out</th>
                <th className="px-5 py-3 text-right font-medium">New Member</th>
                <th className="px-5 py-3 text-right font-medium">Renewal</th>
                <th className="px-5 py-3 text-right font-medium">Interest</th>
                <th className="px-5 py-3 text-right font-medium">Investment Gain / Loss</th>
                <th className="px-5 py-3 text-right font-medium">Profit</th>
                <th className="px-5 py-3 text-right font-medium">Loss</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedYear === null && (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-sm text-slate-500">
                    Select a year and month to view the report.
                  </td>
                </tr>
              )}
              {paginatedAnnualRows.map((row) => (
                <tr key={row.key} className={row.key === selectedMonthKey ? "bg-emerald-50/60" : undefined}>
                  <td className="px-5 py-4 font-medium text-slate-800 sm:px-6">{row.label}</td>
                  <td className="px-5 py-4 text-xs leading-5 text-slate-500">
                    {reportLoading ? (
                      "Calculating profit and loss..."
                    ) : (
                      <>
                        <p><span className="font-semibold text-[#087b55]">Profit:</span> {getMonthlyDescription(row).profit}</p>
                        <p><span className="font-semibold text-red-600">Loss:</span> {getMonthlyDescription(row).loss}</p>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.fineIn)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.fineOut)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.newMember)}</td>
                <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.renewal)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.interest)}</td>
                  <td className={`px-5 py-4 text-right font-semibold ${row.investmentGainOrLoss >= 0 ? "text-[#087b55]" : "text-red-600"}`}>{reportLoading ? "—" : formatCurrency(row.investmentGainOrLoss)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-[#087b55]">{isLoading ? "—" : formatCurrency(row.profit)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-red-600">{reportLoading ? "—" : formatCurrency(row.loss)}</td>
                  <td className={`px-5 py-4 text-right font-semibold sm:px-6 ${row.net >= 0 ? "text-[#087b55]" : "text-red-600"}`}>
                    {reportLoading ? "—" : formatCurrency(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            
          </table>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <Pagination
            totalItems={annualRows.length}
            currentPage={activeOverviewPage}
            pageSize={pageSize}
            onPageChange={setOverviewPage}
          />
        </div>
      </section>

      {canWriteProfitLoss ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6">
          <div>
            <p className="text-base font-semibold text-slate-900">Add Loss</p>
            <p className="mt-1 text-sm text-slate-500">Investments are already included automatically. Add only other losses here.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_auto] lg:items-end">
            <label className="block text-sm font-medium text-slate-700">
              Amount
              <input
                type="number"
                min="0"
                step="1"
                name="amount"
                value={amount ?? (monthlyLoss ? String(monthlyLoss.amount) : "")}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Rs 0"
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-[#087b55] focus:ring-2 focus:ring-[#b9e5d1]"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Details
              <input
                type="text"
                name="details"
                value={details ?? monthlyLoss?.details ?? ""}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Optional note"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-[#087b55] focus:ring-2 focus:ring-[#b9e5d1]"
              />
            </label>

            <button
              type="submit"
              disabled={isSaving || !lossMonthKey}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#087b55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#07583e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSaving ? "Saving..." : monthlyLoss ? "Update loss" : "Save loss"}
            </button>
          </form>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 text-sm text-slate-500 sm:p-6">
          You have read-only access to Profit &amp; Loss. Contact an administrator
          if you need to add or update losses.
        </section>
      )}

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <p className="text-base font-semibold text-slate-900">Monthly details</p>
          <p className="mt-1 text-sm text-slate-500">Profits and losses for {selectedMonthLabel}.</p>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Category</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Details</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedYear === null && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                    Select a year to view the details.
                  </td>
                </tr>
              )}
              {paginatedDetailRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-slate-800 sm:px-6">{row.category}</td>
                  <td className={`px-5 py-4 font-medium ${row.type === "Profit" ? "text-[#087b55]" : "text-red-600"}`}>
                    {row.type}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{row.details}</td>
                  <td className={`px-5 py-4 text-right font-semibold ${row.type === "Profit" ? "text-[#087b55]" : "text-red-600"}`}>
                    {row.amount < 0 || row.type === "Loss" ? "-" : "+"}
                    {formatCurrency(Math.abs(row.amount))}
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    {row.lossId !== undefined && canWriteProfitLoss ? (
                      <button
                        type="button"
                        onClick={() => void deleteLossEntry(row.lossId as number)}
                        disabled={isDeleting}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Delete monthly loss"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Automatic</span>
                    )}
                  </td>
                </tr>
              ))}
              {selectedYear !== null && detailRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                    No details recorded for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <Pagination
            totalItems={detailRows.length}
            currentPage={activeDetailsPage}
            pageSize={pageSize}
            onPageChange={setDetailsPage}
          />
        </div>
      </section>
    </div>
  );
}

export default ProfitLoss;
