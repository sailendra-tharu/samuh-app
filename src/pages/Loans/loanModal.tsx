import { useEffect, useState } from "react";
import NepaliDate from "nepali-date-converter";

import {
  calculateLoanEmi,
  calculateLoanInterest,
  calculateRemainingPrincipal,
  type Loan,
} from "@/api/loan";
import DatePicker from "@/component/DatePicker/datepicker";
import { useMembers } from "@/hook/member";

type LoanFormProps = {
  initialData?: Loan;
  onSubmit: (loan: Loan) => void | Promise<void>;
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

const createEmptyForm = (): Loan => ({
  memberId: null,
  status: "active",
  renewedFromLoanId: null,
  name: "",
  loanDate: formatLocalDate(new Date()),
  loanTermYears: null,
  description: "",
  principalAmount: null,
  fineIn: null,
  fineOut: 0,
  interest: null,
  interestPaid: 0,
  emi: null,
  renewalPaid: 0,
  paidAmount: 0,
  remainingPrincipal: null,
  payments: [],
});

export default function LoanForm({
  initialData,
  onSubmit,
  onCancel,
  error,
}: LoanFormProps) {
  const [form, setForm] = useState<Loan>(createEmptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { members } = useMembers();

  useEffect(() => {
    const loan = initialData ?? createEmptyForm();

    // Form state must reset when the modal switches between add and edit modes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      ...loan,
      remainingPrincipal: calculateRemainingPrincipal(
        loan.principalAmount,
        loan.paidAmount
      ),
      interest: calculateLoanInterest(
        calculateRemainingPrincipal(loan.principalAmount, loan.paidAmount)
      ),
      emi:
        calculateLoanEmi(loan.principalAmount, loan.loanTermYears) ??
        loan.emi,
    });
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = event.target;
    const matchingMember =
      name === "name"
        ? members.find(
            (member) =>
              member.name.trim().toLowerCase() === value.trim().toLowerCase()
          )
        : undefined;

    const nextValue =
      type === "number" ? (value === "" ? null : Number(value)) : value;

    setForm((previous) => {
      const nextForm = {
        ...previous,
        [name]: nextValue,
        ...(name === "name"
          ? { memberId: matchingMember?.id ?? null }
          : {}),
      } as Loan;

      if (name === "principalAmount") {
        nextForm.remainingPrincipal = calculateRemainingPrincipal(
          nextValue as number | null,
          previous.paidAmount
        );
        nextForm.interest = calculateLoanInterest(
          nextForm.remainingPrincipal
        );
      }

      if (name === "principalAmount" || name === "loanTermYears") {
        const principalAmount =
          name === "principalAmount"
            ? (nextValue as number | null)
            : previous.principalAmount;
        const loanTermYears =
          name === "loanTermYears"
            ? (nextValue as number | null)
            : previous.loanTermYears;

        nextForm.emi = calculateLoanEmi(principalAmount, loanTermYears);
      }

      return nextForm;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(form);
      setForm(createEmptyForm());
    } catch {
      // The parent displays the error and keeps the form open.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter member name"
          list="registered-loan-member-names"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          required
        />
        <datalist id="registered-loan-member-names">
          {members.map((member) => (
            <option key={member.id} value={member.name} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter description"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          label="Principal Amount"
          name="principalAmount"
          value={form.principalAmount}
          onChange={handleChange}
          required
        />
        <NumberField
          label="Loan Term (Years)"
          name="loanTermYears"
          value={form.loanTermYears}
          onChange={handleChange}
          required
        />
        <NumberField
          label="Fine In"
          name="fineIn"
          value={form.fineIn}
          onChange={handleChange}
        />
        <NumberField
          label="Fine Out (Auto)"
          name="fineOut"
          value={form.fineOut}
          onChange={handleChange}
          readOnly
        />
        <NumberField
          label="Interest (Auto)"
          name="interest"
          value={form.interest}
          onChange={handleChange}
          readOnly
        />
        <NumberField
          label="Monthly EMI (Auto)"
          name="emi"
          value={form.emi}
          onChange={handleChange}
          readOnly
          required
        />
      </div>

      <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-gray-700">
        Monthly EMI is the planned amount. Use the green plus button in the
        table to record each payment; paying more than the EMI is allowed.
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Loan Date (B.S.)
        </label>
        <DatePicker
          value={toBSDate(form.loanDate)}
          onChange={(bsDate) =>
            setForm((previous) => ({
              ...previous,
              loanDate: toADDate(bsDate),
            }))
          }
          label=""
          placeholder="Select loan date"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Loan" : "Save Loan"}
        </button>
      </div>
    </form>
  );
}

type NumberFieldProps = {
  label: string;
  name: string;
  value: number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
};

function NumberField({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  required = false,
}: NumberFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        min="0"
        step="1"
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${readOnly ? "cursor-not-allowed bg-gray-100" : ""}`}
      />
    </div>
  );
}
