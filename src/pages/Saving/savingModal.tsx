import { useEffect, useState } from "react";
import NepaliDate from "nepali-date-converter";

import type { Saving } from "@/api/saving";
import DatePicker from "@/component/DatePicker/datepicker";
import { useMembers } from "@/hook/member";

type SavingFormProps = {
  initialData?: Saving;
  onSubmit: (saving: Saving) => void | Promise<void>;
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

const createEmptyForm = (): Saving => ({
  memberId: null,
  name: "",
  groupName: "",
  newMember: "",
  date: formatLocalDate(new Date()),
  description: "",
  fineIn: null,
  fineOut: 0,
  paymentReceived: null,
});

export default function SavingForm({
  initialData,
  onSubmit,
  onCancel,
  error,
}: SavingFormProps) {
  const [form, setForm] = useState<Saving>(createEmptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { members } = useMembers();

  useEffect(() => {
    // Reset the form when the modal switches between add and edit modes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialData ?? createEmptyForm());
  }, [initialData]);

  useEffect(() => {
    if (!initialData || initialData.memberId !== null || members.length === 0) {
      return;
    }

    const matchingMember = members.find(
      (member) =>
        member.name.trim().toLowerCase() ===
        initialData.name.trim().toLowerCase()
    );

    if (matchingMember?.id !== undefined) {
      // Resolve legacy name-only savings to the registered member id.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((previous) => ({
        ...previous,
        memberId: matchingMember.id ?? null,
      }));
    }
  }, [initialData, members]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = e.target;
    const matchingMember =
      name === "name"
        ? members.find(
            (member) =>
              member.name.trim().toLowerCase() ===
              value.trim().toLowerCase()
          )
        : undefined;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "number" ? (value === "" ? null : Number(value)) : value,
      ...(name === "name"
        ? { memberId: matchingMember?.id ?? null }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          list="registered-member-names"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          required
        />
        <datalist id="registered-member-names">
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
        <TextField
          label="Group Name"
          name="groupName"
          value={form.groupName}
          onChange={handleChange}
          placeholder="Enter group name"
        />
        <TextField
          label="New Member"
          name="newMember"
          value={form.newMember}
          onChange={handleChange}
          placeholder="Enter new member"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField
          label="Fine In"
          name="fineIn"
          value={form.fineIn}
          onChange={handleChange}
        />
        <NumberField
          label="Fine Out"
          name="fineOut"
          value={form.fineOut}
          onChange={handleChange}
        />
        <NumberField
          label="Payment Received"
          name="paymentReceived"
          value={form.paymentReceived}
          onChange={handleChange}
        />
      </div>

       <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Date (B.S.)
        </label>
        <DatePicker
          value={toBSDate(form.date)}
          onChange={(bsDate) =>
            setForm((previous) => ({
              ...previous,
              date: toADDate(bsDate),
            }))
          }
          label=""
          placeholder="Select date"
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
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Saving"
              : "Save Saving"}
        </button>
      </div>
    </form>
  );
}

type NumberFieldProps = {
  label: string;
  name: string;
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type TextFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
};

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function NumberField({ label, name, value, onChange }: NumberFieldProps) {
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
        min="0"
        step="1"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
