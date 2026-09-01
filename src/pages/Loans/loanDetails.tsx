import { useMemo, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import {
  calculateLoanInterest,
  calculateRemainingPrincipal,
} from "@/api/loan";
import Loader from "@/component/Loader/loader";
import Pagination from "@/component/Pagination/pagination";
import { useLoanDetails } from "@/hook/loan";
import { printPdf } from "@/lib/export";

type PaymentDetail = {
  key: string;
  paymentDate: string;
  amount: number;
  finePaid: number;
  interestPaid: number;
  renewalPaid: number;
  remainingPrincipal: number | null;
  interest: number | null;
  monthKey: string;
};

const formatAmount = (amount: number | null) =>
  amount === null ? "—" : amount.toLocaleString();

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") return message;
  }

  return "Unable to load loan details.";
};

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

export default function LoanDetails() {
  const { id } = useParams<{ id: string }>();
  const loanId = id && Number.isInteger(Number(id)) ? Number(id) : undefined;
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const { loan, isLoading, error } = useLoanDetails(loanId);

  const monthOptions = getMonthOptions(selectedYear ?? currentYear);
  const yearOptions = getYearOptions(currentYear);
  const selectedMonthKey =
    selectedYear !== null && selectedMonth !== null
      ? new NepaliDate(selectedYear, selectedMonth, 1).format("YYYY-MM")
      : null;
  const paymentDetails = useMemo<PaymentDetail[]>(() => {
    if (!loan || selectedYear === null) return [];

    const payments = [...loan.payments].sort((a, b) => {
      const dateOrder = a.paymentDate.localeCompare(b.paymentDate);
      return dateOrder || (a.id ?? 0) - (b.id ?? 0);
    });

    const allPaymentDetails = payments.map((payment, index) => {
      const cumulativePaid = payments
        .slice(0, index + 1)
        .reduce((total, currentPayment) => total + currentPayment.amount, 0);

      const nepaliDate = new NepaliDate(new Date(payment.paymentDate));
      const remainingPrincipal = calculateRemainingPrincipal(
        loan.principalAmount,
        cumulativePaid
      );

      return {
        key: String(payment.id ?? `${payment.paymentDate}-${index}`),
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        finePaid: payment.finePaid,
        interestPaid: payment.interestPaid,
        renewalPaid: payment.renewalPaid,
        remainingPrincipal,
        interest: calculateLoanInterest(remainingPrincipal),
        monthKey: nepaliDate.format("YYYY-MM"),
      };
    });

    if (allPaymentDetails.length > 0) {
      const recordedFinePaid = allPaymentDetails.reduce(
        (total, payment) => total + payment.finePaid,
        0
      );
      const recordedRenewalPaid = allPaymentDetails.reduce(
        (total, payment) => total + payment.renewalPaid,
        0
      );
      const latestPayment = allPaymentDetails[allPaymentDetails.length - 1];

      // Older payment rows may not have fine_paid/renewal_paid columns.
      // Keep the table aligned with the aggregate values stored on the loan.
      latestPayment.finePaid += Math.max(
        0,
        (loan.fineOut ?? 0) - recordedFinePaid
      );
      latestPayment.renewalPaid += Math.max(
        0,
        loan.renewalPaid - recordedRenewalPaid
      );
    }

    return allPaymentDetails
      .filter(
        (payment) =>
          payment.monthKey.startsWith(`${selectedYear}-`) &&
          (selectedMonthKey === null || payment.monthKey === selectedMonthKey)
      )
      .reverse();
  }, [loan, selectedMonthKey, selectedYear]);
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(paymentDetails.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const paginatedPaymentDetails = paymentDetails.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  const exportLoanDetails = () => {
    if (paymentDetails.length === 0) return;

    printPdf(
      `Loan Details - ${selectedMonthKey ?? `${selectedYear} - All Months`}`,
      [
        "Payment Date",
        "Principal Paid",
        "Fine Paid",
        "Interest",
        "Renewal Paid",
        "Remaining Principal",
        "Current Interest",
      ],
      paymentDetails.map((payment) => [
        new NepaliDate(new Date(payment.paymentDate)).format("DD MMMM YYYY"),
        payment.amount,
        payment.finePaid,
        payment.interestPaid,
        payment.renewalPaid,
        payment.remainingPrincipal ?? "",
        payment.interest ?? "",
      ])
    );
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        Unable to load loan details: {getErrorMessage(error)}
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="space-y-4">
        <Link
          to="/loans"
          className="inline-flex items-center gap-2 text-base font-semibold text-green-700 hover:text-green-800"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
          Back to loans
        </Link>
        <p className="rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Loan not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to="/loans"
        className="inline-flex items-center gap-2 text-base font-semibold text-green-700 hover:text-green-800"
      >
        <ArrowLeft size={22} strokeWidth={2.5} />
        Back to loans
      </Link>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Loan Payment Details
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
                aria-label="Loan details year"
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
                aria-label="Loan details month"
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
              onClick={exportLoanDetails}
              disabled={paymentDetails.length === 0}
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
                <th className="border-r border-white/20 px-4 py-3">Payment Date</th>
                <th className="border-r border-white/20 px-4 py-3">
                  Principal Paid
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Fine Paid
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Interest
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Renewal Paid
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Remaining Principal
                </th>
                <th className="px-4 py-3">Current Interest</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPaymentDetails.map((payment) => (
                <tr key={payment.key} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {new NepaliDate(new Date(payment.paymentDate)).format(
                      "DD MMMM YYYY"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.finePaid)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.interestPaid)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.renewalPaid)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.remainingPrincipal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.interest)}
                  </td>
                </tr>
              ))}

              {paymentDetails.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {selectedYear !== null
                      ? "No payments recorded for this loan in the selected period."
                      : "Select a year to view payments."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={paymentDetails.length}
          currentPage={activePage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
