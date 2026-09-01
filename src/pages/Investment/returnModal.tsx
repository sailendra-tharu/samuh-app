import { useState } from "react";

import type { Investment } from "@/api/investment";

type ReturnFormProps = {
  investment: Investment;
  onSubmit: (amount: number) => void | Promise<void>;
  onCancel: () => void;
  error?: string;
};

export default function ReturnForm({
  investment,
  onSubmit,
  onCancel,
  error,
}: ReturnFormProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit(parsedAmount);
      setAmount("");
    } catch {
      // The parent displays the error and keeps the form open.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">{investment.name}</p>
        <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
          <span>
            Invested: <strong>Rs {(investment.investedAmount ?? 0).toLocaleString()}</strong>
          </span>
          <span>
            Already returned: <strong>Rs {investment.returnValue.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Return Value
        </label>
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Enter amount returned"
          min="1"
          step="1"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          required
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500">
          This amount will be added to the investment&apos;s total returned value.
        </p>
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
          {isSubmitting ? "Saving..." : "Save Return"}
        </button>
      </div>
    </form>
  );
}
