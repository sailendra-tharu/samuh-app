import { useEffect, useState } from "react";
import NepaliDate from "nepali-date-converter";

import {
  calculateRemainingFine,
  calculateRemainingRenewalInterest,
  isLoanTermExpired,
  type Loan,
  type LoanPayment,
} from "@/api/loan";
import DatePicker from "@/component/DatePicker/datepicker";

export type LoanPaymentDraft = {
  paymentDate: LoanPayment["paymentDate"];
  amount: LoanPayment["amount"] | null;
  finePaid: LoanPayment["finePaid"] | null;
  interestPaid: LoanPayment["interestPaid"] | null;
  renewalPaid: LoanPayment["renewalPaid"] | null;
};

type PaymentFormProps = {
  loan: Loan;
  onSubmit: (payment: LoanPaymentDraft) => void | Promise<void>;
  onCancel: () => void;
  error?: string;
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toBSDate = (adDate: string) => {
  if (!adDate) return "";

  try {
    return new NepaliDate(parseLocalDate(adDate)).format("YYYY-MM-DD");
  } catch {
    return "";
  }
};

const toADDate = (bsDate: string) => {
  if (!bsDate) return "";

  try {
    return formatLocalDate(new NepaliDate(bsDate).toJsDate());
  } catch {
    return "";
  }
};

const createEmptyForm = (loan: Loan): LoanPaymentDraft => ({
  paymentDate: formatLocalDate(new Date()),
  amount: loan.emi,
  finePaid: 0,
  interestPaid: loan.interest ?? 0,
  renewalPaid: 0,
});

export default function PaymentForm({
  loan,
  onSubmit,
  onCancel,
  error,
}: PaymentFormProps) {
  const [form, setForm] = useState<LoanPaymentDraft>(() =>
    createEmptyForm(loan)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const renewalIsDue =
    loan.remainingPrincipal !== null &&
    loan.remainingPrincipal > 0 &&
    isLoanTermExpired(loan.loanDate, loan.loanTermYears);
  const remainingRenewalInterest = renewalIsDue
    ? calculateRemainingRenewalInterest(
        loan.remainingPrincipal,
        loan.renewalPaid
      )
    : 0;

  useEffect(() => {
    // Reset the payment form whenever a different loan is selected.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(createEmptyForm(loan));
  }, [loan]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setForm((previous) => ({
      ...previous,
      amount: value === "" ? null : Number(value),
    }));
  };

  const handleFinePaidChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;

    setForm((previous) => ({
      ...previous,
      finePaid: value === "" ? null : Number(value),
    }));
  };

  const handleRenewalPaidChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;

    setForm((previous) => ({
      ...previous,
      renewalPaid: value === "" ? null : Number(value),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(form);
    } catch {
      // The parent displays the error and keeps the form open.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm sm:grid-cols-3">
        <p>
          <span className="font-medium text-gray-600">Monthly EMI: </span>
          <span className="font-semibold text-gray-900">
            {loan.emi === null ? "—" : loan.emi.toLocaleString()}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-600">Current Remaining: </span>
          <span className="font-semibold text-gray-900">
            {loan.remainingPrincipal === null
              ? "—"
              : loan.remainingPrincipal.toLocaleString()}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-600">
            Fine In (Remaining): 
          </span>
          <span className="font-semibold text-gray-900">
            {calculateRemainingFine(loan.fineIn, loan.fineOut).toLocaleString()}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-600">Fine Out (Paid): </span>
          <span className="font-semibold text-gray-900">
            {(loan.fineOut ?? 0).toLocaleString()}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-600">Renewal Paid: </span>
          <span className="font-semibold text-gray-900">
            {loan.renewalPaid.toLocaleString()}
          </span>
        </p>
        <p>
          <span className="font-medium text-gray-600">
            Renewal Remaining: 
          </span>
          <span className="font-semibold text-gray-900">
            {remainingRenewalInterest.toLocaleString()}
          </span>
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Payment Amount
        </label>
        <input
          type="number"
          value={form.amount ?? ""}
          onChange={handleAmountChange}
          min="0"
          step="1"
          placeholder="Enter amount paid"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter 0 if this payment is only for the fine.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Fine Paid (Fine Out)
        </label>
        <input
          type="number"
          value={form.finePaid ?? ""}
          onChange={handleFinePaidChange}
          min="0"
          max={calculateRemainingFine(loan.fineIn, loan.fineOut)}
          step="1"
          placeholder="Enter fine paid"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-xs text-gray-500">
          This amount is added to Fine Out after the payment is saved.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Interest
        </label>
        <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
          {(loan.interest ?? 0).toLocaleString()}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Automatically populated from the loan Interest value and recorded when this payment is saved.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Renewal Paid
        </label>
        <input
          type="number"
          value={form.renewalPaid ?? ""}
          onChange={handleRenewalPaidChange}
          min="0"
          max={remainingRenewalInterest}
          step="1"
          placeholder="Enter renewal amount paid"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-xs text-gray-500">
          Renewal payment is available after the loan term expires.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Payment Date (B.S.)
        </label>
        <DatePicker
          value={toBSDate(form.paymentDate)}
          onChange={(bsDate) =>
            setForm((previous) => ({
              ...previous,
              paymentDate: toADDate(bsDate),
            }))
          }
          label=""
          placeholder="Select payment date"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Payment"}
        </button>
      </div>
    </form>
  );
}
