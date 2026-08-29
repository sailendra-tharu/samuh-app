import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import {
  calculateLoanInterest,
  calculateRemainingPrincipal,
} from "@/api/loan";
import Loader from "@/component/Loader/loader";
import { useLoanDetails } from "@/hook/loan";

type MonthlyPayment = {
  key: string;
  month: string;
  paymentCount: number;
  paidAmount: number;
  finePaid: number;
  renewalPaid: number;
  remainingPrincipal: number | null;
  interest: number | null;
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

export default function LoanDetails() {
  const { id } = useParams<{ id: string }>();
  const loanId = id && Number.isInteger(Number(id)) ? Number(id) : undefined;
  const { loan, isLoading, error } = useLoanDetails(loanId);

  const monthlyPayments = useMemo(() => {
    if (!loan) return [];

    const grouped = new Map<string, MonthlyPayment>();
    const payments = [...loan.payments].sort((a, b) => {
      const dateOrder = a.paymentDate.localeCompare(b.paymentDate);
      return dateOrder || (a.id ?? 0) - (b.id ?? 0);
    });

    let cumulativePaid = 0;

    payments.forEach((payment) => {
      cumulativePaid += payment.amount;

      const nepaliDate = new NepaliDate(new Date(payment.paymentDate));
      const key = nepaliDate.format("YYYY-MM");
      const existing = grouped.get(key);
      const remainingPrincipal = calculateRemainingPrincipal(
        loan.principalAmount,
        cumulativePaid
      );

      if (existing) {
        existing.paymentCount += 1;
        existing.paidAmount += payment.amount;
        existing.finePaid += payment.finePaid;
        existing.renewalPaid += payment.renewalPaid;
        existing.remainingPrincipal = remainingPrincipal;
        existing.interest = calculateLoanInterest(remainingPrincipal);
        return;
      }

      grouped.set(key, {
        key,
        month: nepaliDate.format("MMMM YYYY"),
        paymentCount: 1,
        paidAmount: payment.amount,
        finePaid: payment.finePaid,
        renewalPaid: payment.renewalPaid,
        remainingPrincipal,
        interest: calculateLoanInterest(remainingPrincipal),
      });
    });

    const result = Array.from(grouped.values()).sort((a, b) =>
      b.key.localeCompare(a.key)
    );

    if (result.length > 0) {
      const recordedFinePaid = result.reduce(
        (total, payment) => total + payment.finePaid,
        0
      );
      const recordedRenewalPaid = result.reduce(
        (total, payment) => total + payment.renewalPaid,
        0
      );
      const latestPayment = result[0];

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

    return result;
  }, [loan]);

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
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Monthly Loan Payments
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-[#006b45] text-left text-sm text-white">
              <tr>
                <th className="border-r border-white/20 px-4 py-3">Month</th>
                <th className="border-r border-white/20 px-4 py-3">
                  Payments
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Paid Principal
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Fine Paid
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Renewal Paid
                </th>
                <th className="border-r border-white/20 px-4 py-3">
                  Remaining Principal
                </th>
                <th className="px-4 py-3">Interest</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPayments.map((payment) => (
                <tr key={payment.key} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {payment.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {payment.paymentCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatAmount(payment.finePaid)}
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

              {monthlyPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No payments recorded for this loan.
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
