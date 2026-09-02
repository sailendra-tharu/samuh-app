import { useEffect, useState } from "react";

import type { InvestmentFundIssue } from "@/api/investmentFund";

type IssueFundsFormProps = {
  initialData?: InvestmentFundIssue;
  onSubmit: (issue: InvestmentFundIssue) => void | Promise<void>;
  onCancel: () => void;
  error?: string;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = (): InvestmentFundIssue => ({
  amount: 0,
  issueDate: getToday(),
  description: "",
});

export default function IssueFundsForm({
  initialData,
  onSubmit,
  onCancel,
  error,
}: IssueFundsFormProps) {
  const [form, setForm] = useState<InvestmentFundIssue>(
    initialData ?? createEmptyForm
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset the form when switching between a new issue and an existing issue.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialData ?? createEmptyForm());
  }, [initialData]);

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
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800">Issue funds for investment</p>
        <p className="mt-1 text-sm leading-6 text-amber-700">
          Record the total money withdrawn or set aside. You can use this fund
          for one or more investments.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Amount Issued
          </label>
          <input
            type="number"
            value={form.amount || ""}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                amount: event.target.value === "" ? 0 : Number(event.target.value),
              }))
            }
            min="0.01"
            step="0.01"
            placeholder="e.g. 5000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Issue Date
          </label>
          <input
            type="date"
            value={form.issueDate}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                issueDate: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Purpose / Details <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              description: event.target.value,
            }))
          }
          rows={3}
          placeholder="e.g. Funds withdrawn for Sunrise Hydropower shares"
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          {isSubmitting
            ? "Saving..."
            : initialData?.id !== undefined
              ? "Save Changes"
              : "Issue Funds"}
        </button>
      </div>
    </form>
  );
}
