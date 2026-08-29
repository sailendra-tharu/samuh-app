import { useEffect, useState } from "react";
import type { Member } from "./useColumn";
import DatePicker from "@/component/DatePicker/datepicker";

type MemberFormProps = {
  initialData?: Member;
  onSubmit: (member: Member) => void | Promise<void>;
  onCancel: () => void;
  error?: string;
};

const emptyForm: Member = {
  name: "",
  email: "",
  phone: "",
  group: "",
  joinDate: "",
};

export default function MemberForm({
  initialData,
  onSubmit,
  onCancel,
  error,
}: MemberFormProps) {
  const [form, setForm] = useState<Member>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await onSubmit(form);
      setForm(emptyForm);
    } catch {
      // The parent displays the database error while preserving the form.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter member name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          required
        />
      </div>

      {/* Group */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Group
        </label>
        <input
          name="group"
          value={form.group}
          onChange={handleChange}
          placeholder="Enter group"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          required
        />
      </div>

      {/* Join Date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Join Date
        </label>
        <DatePicker
          value={form.joinDate}
          onChange={(date) =>
            setForm((prev) => ({ ...prev, joinDate: date }))
          }
          placeholder="Select join date"
        />
      </div>

      {/* Buttons */}
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
          className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
        >
          {initialData ? "Update Member" : "Save Member"}
        </button>
      </div>
    </form>
  );
}
