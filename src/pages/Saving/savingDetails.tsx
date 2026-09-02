import { useMemo, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import Loader from "@/component/Loader/loader";
import Pagination from "@/component/Pagination/pagination";
import type { Saving } from "@/api/saving";
import { useMembers } from "@/hook/member";
import { useMemberSavings } from "@/hook/saving";
import { printPdf } from "@/lib/export";

const formatAmount = (amount: number | null) =>
  (amount ?? 0).toLocaleString();

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

export default function SavingDetails() {
  const { id } = useParams<{ id: string }>();
  const memberId = id && Number.isInteger(Number(id)) ? Number(id) : undefined;
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const { members, isLoading: membersLoading } = useMembers();
  const memberName = members.find((item) => item.id === memberId)?.name;
  const { savings, isLoading: savingsLoading } = useMemberSavings(
    memberId,
    memberName
  );

  const monthOptions = getMonthOptions(selectedYear ?? currentYear);
  const yearOptions = getYearOptions(currentYear);
  const selectedMonthKey =
    selectedYear !== null && selectedMonth !== null
      ? new NepaliDate(selectedYear, selectedMonth, 1).format("YYYY-MM")
      : null;
  const visibleSavings = useMemo<Saving[]>(
    () =>
      selectedYear !== null
        ? savings
            .filter(
              (saving) => {
                const nepaliDate = new NepaliDate(new Date(saving.date));

                return (
                  nepaliDate.format("YYYY") === String(selectedYear) &&
                  (selectedMonthKey === null ||
                    nepaliDate.format("YYYY-MM") === selectedMonthKey)
                );
              }
            )
            .sort((a, b) => {
              const dateOrder = b.date.localeCompare(a.date);
              return dateOrder || (b.id ?? 0) - (a.id ?? 0);
            })
        : [],
    [savings, selectedMonthKey, selectedYear]
  );
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(visibleSavings.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const paginatedSavings = visibleSavings.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  const exportSavingsDetails = () => {
    if (visibleSavings.length === 0) return;

    printPdf(
      `${memberName ?? savings[0]?.name ?? "Saving"} - Saving Details - ${
        selectedMonthKey ?? `${selectedYear} - All Months`
      }`,
      [
        "Date",
        "Group Name",
        "New Member",
        "Fine In",
        "Fine Out",
        "Payment Received",
        "Description",
      ],
      visibleSavings.map((saving) => [
        new NepaliDate(new Date(saving.date)).format("DD MMMM YYYY"),
        saving.groupName,
        saving.newMember,
        getRemainingFine(saving.fineIn, saving.fineOut),
        saving.fineOut ?? 0,
        saving.paymentReceived ?? 0,
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

      <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {memberName ?? savings[0]?.name ?? "Saving"} - Saving Details
          </h2>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <div className="flex w-full gap-2 sm:w-auto">
              <select
                value={selectedYear ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedYear(value ? Number(value) : null);
                  setSelectedMonth(null);
                  setCurrentPage(1);
                }}
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-28 sm:flex-none"
                aria-label="Saving details year"
              >
                <option value="">Select year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedMonth(value ? Number(value) : null);
                  setCurrentPage(1);
                }}
                disabled={selectedYear === null}
                className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-36 sm:flex-none"
                aria-label="Saving details month"
              >
                <option value="">Select month</option>
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
              disabled={visibleSavings.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-[640px] border-collapse border border-gray-200">
            <thead className="bg-[#006b45] text-left text-sm text-white">
              <tr>
                <th className="border-r border-white/20 px-4 py-3">Date</th>
                <th className="border-r border-white/20 px-4 py-3">Group Name</th>
                <th className="border-r border-white/20 px-4 py-3">New Member</th>
                <th className="border-r border-white/20 px-4 py-3">Fine In</th>
                <th className="border-r border-white/20 px-4 py-3">Fine Out</th>
                <th className="border-r border-white/20 px-4 py-3">
                  Payment Received
                </th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSavings.map((saving) => (
                <tr
                  key={saving.id ?? `${saving.date}-${saving.name}-${saving.description}`}
                  className="border-b border-gray-100"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {new NepaliDate(new Date(saving.date)).format("DD MMMM YYYY")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {saving.groupName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {saving.newMember || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(getRemainingFine(saving.fineIn, saving.fineOut))}
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

              {visibleSavings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {selectedYear !== null
                      ? "No savings recorded for this member in the selected period."
                      : "Select a year to view savings."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={visibleSavings.length}
          currentPage={activePage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
