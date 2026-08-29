import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import NepaliDate from "nepali-date-converter";

import type { Saving } from "@/api/saving";

export type { Saving } from "@/api/saving";

const formatDateToBS = (dateString: string): string => {
  if (!dateString) return "";

  try {
    return new NepaliDate(new Date(dateString)).format("DD MMMM YYYY");
  } catch {
    return dateString;
  }
};

const formatAmount = (amount: number | null) =>
  amount === null ? "—" : amount.toLocaleString();

const helper = createColumnHelper<Saving>();

export const userColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void
) => [
  helper.display({
    id: "sn",
    header: "SN",
    cell: ({ row }) => row.index + 1,
  }),

  helper.accessor("name", {
    header: "Name",
  }),

  helper.accessor("date", {
    header: "Date",
    cell: ({ getValue }) => formatDateToBS(getValue()),
  }),

  helper.accessor("description", {
    header: "Description",
    cell: ({ getValue }) => getValue() || "—",
  }),

  helper.accessor("fineIn", {
    header: "Fine In",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("fineOut", {
    header: "Fine Out",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("paymentReceived", {
    header: "Payment Received",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.display({
    id: "action",
    header: "Action",
    size: 1,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
          onClick={() => onEdit(row.index)}
          title="Edit"
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          className="rounded-md p-2 text-red-600 hover:bg-red-100"
          onClick={() => onDelete(row.index)}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  }),
];
