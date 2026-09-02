import { useEffect, useState } from "react";

import type { Investment, InvestmentStatus } from "@/api/investment";

type InvestmentFormProps = {
  initialData?: Investment;
  onSubmit: (investment: Investment) => void | Promise<void>;
  onCancel: () => void;
  error?: string;
};

const createEmptyForm = (): Investment => ({
  name: "",
  type: "",
  investedAmount: null,
  currentValue: null,
  returnValue: 0,
  status: "active",
});

const investmentTypes = [
  "Business",
  "Shares",
  "Fixed Deposit",
  "Land",
  "Equipment",
  "Other",
];

export default function InvestmentForm({
  initialData,
  onSubmit,
  onCancel,
  error,
}: InvestmentFormProps) {
  const [form, setForm] = useState<Investment>(createEmptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset the form when the modal switches between add and edit modes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialData ?? createEmptyForm());
  }, [initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = event.target;
    const nextValue =
      type === "number" ? (value === "" ? null : Number(value)) : value;

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    } as Investment));
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
          Investment Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Sunrise Hydropower shares"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Investment Type
          </label>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="Select or enter a type"
            list="investment-types"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />
          <datalist id="investment-types">
            {investmentTypes.map((investmentType) => (
              <option key={investmentType} value={investmentType} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                status: event.target.value as InvestmentStatus,
              }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          label="Invested Amount"
          name="investedAmount"
          value={form.investedAmount}
          onChange={handleChange}
          required
        />
        <NumberField
          label="Current Value"
          name="currentValue"
          value={form.currentValue}
          onChange={handleChange}
          required
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
            : initialData
              ? "Update Investment"
              : "Save Investment"}
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
  required?: boolean;
};

function NumberField({
  label,
  name,
  value,
  onChange,
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
        required={required}
        min="0"
        step="0.01"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
