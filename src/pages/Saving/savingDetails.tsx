import { useMemo, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import Loader from "@/component/Loader/loader";
import { useMembers } from "@/hook/member";
import { useMemberSavings } from "@/hook/saving";
import { printPdf } from "@/lib/export";

const formatAmount = (amount: number) => amount.toLocaleString();

const getRemainingFine = (fineIn: number | null, fineOut: number | null) =>
  Math.max(0, (fineIn ?? 0) - (fineOut ?? 0));

const getMonthOptions = (year: number) =>
  Array.from({ length: 12 }, (_, month) => {
    const date = new NepaliDate(year, month, 1);

    return {
      value: month,
      key: date.format("YYYY-MM"),
      label: date.format("MMMM"),
    };
  });

const getYearOptions = (currentYear: number) =>
  Array.from({ length: 10 }, (_, index) => currentYear - index);

type MonthlySaving = {
  key: string;
  month: string;
  description: string;
  fineIn: number;
  fineOut: number;
  paymentReceived: number;
};

export default function SavingDetails() {
  const { id } = useParams<{ id: string }>();
  const memberId = id && Number.isInteger(Number(id)) ? Number(id) : undefined;
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentBS.getMonth());
  const { members, isLoading: membersLoading } = useMembers();
  const memberName = members.find((item) => item.id === memberId)?.name;
  const { savings, isLoading: savingsLoading } = useMemberSavings(
    memberId,
    memberName
  );

  const monthlySavings = useMemo(() => {
    const grouped = new Map<string, MonthlySaving>();

    savings.forEach((saving) => {
      const nepaliDate = new NepaliDate(new Date(saving.date));
      const key = nepaliDate.format("YYYY-MM");
      const existing = grouped.get(key);

      if (existing) {
        existing.fineIn += getRemainingFine(saving.fineIn, saving.fineOut);
        existing.fineOut += saving.fineOut ?? 0;
        existing.paymentReceived += saving.paymentReceived ?? 0;

        if (saving.description) {
          existing.description = existing.description
            ? `${existing.description}; ${saving.description}`
            : saving.description;
        }

        return;
      }

        grouped.set(key, {
          key,
          month: nepaliDate.format("MMMM YYYY"),
          description: saving.description,
          fineIn: getRemainingFine(saving.fineIn, saving.fineOut),
          fineOut: saving.fineOut ?? 0,
        paymentReceived: saving.paymentReceived ?? 0,
      });
    });

    return Array.from(grouped.values()).sort((a, b) =>
      b.key.localeCompare(a.key)
    );
  }, [savings]);
  const monthOptions = useMemo(() => getMonthOptions(selectedYear), [selectedYear]);
  const yearOptions = useMemo(() => getYearOptions(currentYear), [currentYear]);
  const selectedMonthKey = new NepaliDate(
    selectedYear,
    selectedMonth,
    1
  ).format("YYYY-MM");
  const visibleMonthlySavings = useMemo(
    () => monthlySavings.filter((saving) => saving.key === selectedMonthKey),
    [monthlySavings, selectedMonthKey]
  );
  const exportSavingsDetails = () => {
    if (visibleMonthlySavings.length === 0) return;

    printPdf(
      `${memberName ?? savings[0]?.name ?? "Saving"} - Saving Details - ${selectedMonthKey}`,
      ["Month", "Fine In", "Fine Out", "Payment Received", "Description"],
      visibleMonthlySavings.map((saving) => [
        saving.month,
        saving.fineIn,
        saving.fineOut,
        saving.paymentReceived,
        saving.description,
      ])
    );
  };

  if (membersLoading || savingsLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <Link
        to="/savings"
        className="inline-flex items-center gap-2 text-base font-semibold text-green-700 hover:text-green-800"
      >
        <ArrowLeft size={22} strokeWidth={2.5} />
        Back to savings
      </Link>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {memberName ?? savings[0]?.name ?? "Saving"} - Monthly Savings
          </h2>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <div className="flex w-full gap-2 sm:w-auto">
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-28 sm:flex-none"
                aria-label="Saving details year"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-36 sm:flex-none"
                aria-label="Saving details month"
              >
                {monthOptions.map((month) => (
                  <option key={month.key} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={exportSavingsDetails}
              disabled={visibleMonthlySavings.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-[#006b45] text-left text-sm text-white">
              <tr>
                <th className="border-r border-white/20 px-4 py-3">Month</th>
                <th className="border-r border-white/20 px-4 py-3">Fine In</th>
                <th className="border-r border-white/20 px-4 py-3">Fine Out</th>
                <th className="border-r border-white/20 px-4 py-3">
                  Payment Received
                </th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {visibleMonthlySavings.map((saving) => (
                <tr key={saving.key} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {saving.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(saving.fineIn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(saving.fineOut)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(saving.paymentReceived)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {saving.description || "—"}
                  </td>
                </tr>
              ))}

              {visibleMonthlySavings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No savings recorded for this member.
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
