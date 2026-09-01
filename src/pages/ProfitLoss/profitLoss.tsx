import { useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  CircleDollarSign,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import NepaliDate from "nepali-date-converter";

import type { Loan } from "@/api/loan";
import type { LossEntry } from "@/api/loss";
import type { Saving } from "@/api/saving";
import { useLossEntries } from "@/hook/loss";
import { useLoans } from "@/hook/loan";
import { useSavings } from "@/hook/saving";

type ProfitRow = {
  id: string;
  category: string;
  amount: number;
  details: string;
};

type MonthlySummary = {
  key: string;
  label: string;
  fineOut: number;
  newMember: number;
  renewal: number;
  interest: number;
  profit: number;
  loss: number;
  net: number;
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

  return {
    fineOut,
    renewal: renewal + renewalWithoutPaymentHistory,
    interest: monthLoans.reduce((total, loan) => total + toAmount(loan.interest), 0),
  };
};

function ProfitLoss() {
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const currentMonth = currentBS.getMonth();
  const yearOptions = useMemo(() => getYearOptions(currentYear), [currentYear]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [amount, setAmount] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const { savings, isLoading: savingsLoading } = useSavings();
  const { loans, isLoading: loansLoading, error: loansError } = useLoans();
  const {
    lossEntries,
    isLoading: lossLoading,
    error: lossError,
    saveLoss,
    deleteLoss,
    isSaving,
    isDeleting,
  } = useLossEntries();
  const isLoading = savingsLoading || loansLoading;
  const reportLoading = isLoading || lossLoading;

  const monthOptions = useMemo(() => getMonthOptions(selectedYear), [selectedYear]);
  const selectedMonthKey = new NepaliDate(selectedYear, selectedMonth, 1).format("YYYY-MM");
  const getMonthlySummary = (monthKey: string): MonthlySummary => {
    const savingProfit = getSavingProfit(savings, monthKey);
    const loanProfit = getLoanProfit(loans, monthKey);
    const profit =
      savingProfit.fineOut +
      savingProfit.newMember +
      loanProfit.renewal +
      loanProfit.interest;
    const loss = lossEntries
      .filter((entry) => getBSMonthKey(entry.lossDate) === monthKey)
      .reduce((total, entry) => total + entry.amount, 0);
    const month = monthOptions.find((option) => option.key === monthKey);

    return {
      key: monthKey,
      label: month?.label ?? monthKey,
      fineOut: savingProfit.fineOut + loanProfit.fineOut,
      newMember: savingProfit.newMember,
      renewal: loanProfit.renewal,
      interest: loanProfit.interest,
      profit,
      loss,
      net: profit - loss,
    };
  };
  const selectedSummary = getMonthlySummary(selectedMonthKey);
  const profitRows: ProfitRow[] = [
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
      details: "Automatically calculated from loan records",
    },
  ];
  const monthlyLoss = lossEntries.find(
    (entry) => getBSMonthKey(entry.lossDate) === selectedMonthKey
  );
  const annualRows = monthOptions.map((month) => getMonthlySummary(month.key));
  const annualProfit = annualRows.reduce((total, row) => total + row.profit, 0);
  const annualLoss = annualRows.reduce((total, row) => total + row.loss, 0);
  const annualNet = annualProfit - annualLoss;
  const selectedMonthLabel =
    monthOptions.find((month) => month.key === selectedMonthKey)?.label ?? selectedMonthKey;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amountValue = amount ?? (monthlyLoss ? String(monthlyLoss.amount) : "");
    const lossDetails = details ?? monthlyLoss?.details ?? "";
    const parsedAmount = Number(amountValue);

    if (!amountValue.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return;

    setActionError("");

    const existingLoss = monthlyLoss;

    try {
      await saveLoss({
        id: existingLoss?.id,
        lossDate: getLossDateForMonth(selectedMonthKey),
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
    setActionError("");

    try {
      await deleteLoss(id);
    } catch {
      setActionError("Unable to delete the monthly loss. Please try again.");
    }
  };

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1480px] space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#103f34] px-6 py-7 text-white shadow-[0_18px_45px_-24px_rgba(16,63,52,0.8)] sm:px-8 sm:py-8">
        <div className="relative z-10 flex items-start justify-between gap-5">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
              <ChartNoAxesCombined className="h-3.5 w-3.5" />
              Monthly report
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Profit &amp; Loss
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/75 sm:text-base">
              Profit is calculated automatically. Add only the losses for the selected month.
            </p>
          </div>
          <CircleDollarSign className="hidden h-12 w-12 text-emerald-200/70 sm:block" />
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
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#087b55] focus:ring-2 focus:ring-[#b9e5d1] sm:w-28"
            aria-label="Profit and loss report year"
          >
            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#087b55] focus:ring-2 focus:ring-[#b9e5d1] sm:w-36"
            aria-label="Profit and loss report month"
          >
            {monthOptions.map((month) => (
              <option key={month.key} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-emerald-700">Automatic profit</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-emerald-700">
            {isLoading ? "—" : formatCurrency(selectedSummary.profit)}
          </p>
        </article>

        <article className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-red-700">Manual loss</p>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-red-700">
            {lossLoading ? "—" : formatCurrency(selectedSummary.loss)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">Net profit</p>
            <CircleDollarSign className="h-5 w-5 text-[#087b55]" />
          </div>
          <p className={`mt-3 text-2xl font-semibold tracking-[-0.04em] ${selectedSummary.net >= 0 ? "text-[#087b55]" : "text-red-600"}`}>
            {reportLoading ? "—" : formatCurrency(selectedSummary.net)}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <p className="text-base font-semibold text-slate-900">{selectedYear} monthly overview</p>
          <p className="mt-1 text-sm text-slate-500">Automatic profit and manual loss for every month of the selected year.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Month</th>
                <th className="px-5 py-3 text-right font-medium">Fine Out</th>
                <th className="px-5 py-3 text-right font-medium">New Member</th>
                <th className="px-5 py-3 text-right font-medium">Renewal</th>
                <th className="px-5 py-3 text-right font-medium">Interest</th>
                <th className="px-5 py-3 text-right font-medium">Profit</th>
                <th className="px-5 py-3 text-right font-medium">Loss</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {annualRows.map((row) => (
                <tr key={row.key} className={row.key === selectedMonthKey ? "bg-emerald-50/60" : undefined}>
                  <td className="px-5 py-4 font-medium text-slate-800 sm:px-6">{row.label}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.fineOut)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.newMember)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.renewal)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{isLoading ? "—" : formatCurrency(row.interest)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-[#087b55]">{isLoading ? "—" : formatCurrency(row.profit)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-red-600">{lossLoading ? "—" : formatCurrency(row.loss)}</td>
                  <td className={`px-5 py-4 text-right font-semibold sm:px-6 ${row.net >= 0 ? "text-[#087b55]" : "text-red-600"}`}>
                    {reportLoading ? "—" : formatCurrency(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <td className="px-5 py-4 text-slate-800 sm:px-6">Year total</td>
                <td colSpan={4} />
                <td className="px-5 py-4 text-right text-[#087b55]">{isLoading ? "—" : formatCurrency(annualProfit)}</td>
                <td className="px-5 py-4 text-right text-red-600">{lossLoading ? "—" : formatCurrency(annualLoss)}</td>
                <td className={`px-5 py-4 text-right sm:px-6 ${annualNet >= 0 ? "text-[#087b55]" : "text-red-600"}`}>
                  {reportLoading ? "—" : formatCurrency(annualNet)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6">
        <div>
          <p className="text-base font-semibold text-slate-900">Add manual loss</p>
          <p className="mt-1 text-sm text-slate-500">Profit categories below are calculated from your records automatically.</p>
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
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#087b55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#07583e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {isSaving ? "Saving..." : monthlyLoss ? "Update loss" : "Save loss"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <p className="text-base font-semibold text-slate-900">Monthly details</p>
          <p className="mt-1 text-sm text-slate-500">Automatic profits and manually entered losses for {selectedMonthLabel}.</p>
        </div>

        <div className="overflow-x-auto">
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
              {profitRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-medium text-slate-800 sm:px-6">{row.category}</td>
                  <td className="px-5 py-4 font-medium text-[#087b55]">Profit</td>
                  <td className="px-5 py-4 text-slate-500">{row.details}</td>
                  <td className="px-5 py-4 text-right font-semibold text-[#087b55]">+{formatCurrency(row.amount)}</td>
                  <td className="px-5 py-4 text-right text-xs text-slate-400 sm:px-6">Automatic</td>
                </tr>
              ))}
              {monthlyLoss && (
                <tr key={monthlyLoss.id}>
                  <td className="px-5 py-4 font-medium text-slate-800 sm:px-6">Monthly Loss</td>
                  <td className="px-5 py-4 font-medium text-red-600">Loss</td>
                  <td className="max-w-xs truncate px-5 py-4 text-slate-500">{monthlyLoss.details || "—"}</td>
                  <td className="px-5 py-4 text-right font-semibold text-red-600">-{formatCurrency(monthlyLoss.amount)}</td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (monthlyLoss.id !== undefined) void deleteLossEntry(monthlyLoss.id);
                      }}
                      disabled={isDeleting || monthlyLoss.id === undefined}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Delete monthly loss"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ProfitLoss;
