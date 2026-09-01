import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
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

const getRemainingFine = (fineIn: number | null, fineOut: number | null) =>
  Math.max(0, (fineIn ?? 0) - (fineOut ?? 0));

const helper = createColumnHelper<Saving>();

export const userColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  onAddNextSaving: (index: number) => void
) => [
  helper.display({
    id: "sn",
    header: "SN",
    cell: ({ row }) => row.index + 1,
  }),

  helper.accessor("name", {
    header: "Name",
  }),

  helper.accessor("groupName", {
    header: "Group Name",
    cell: ({ getValue }) => getValue() || "—",
  }),

  helper.accessor("newMember", {
    header: "New Member",
    cell: ({ getValue }) => getValue() || "—",
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
    cell: ({ row }) =>
      getRemainingFine(row.original.fineIn, row.original.fineOut).toLocaleString(),
  }),

  helper.accessor("fineOut", {
    header: "Fine Out",
    cell: ({ getValue }) => (getValue() ?? 0).toLocaleString(),
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
          className="rounded-md p-2 text-green-600 hover:bg-green-100"
          onClick={(event) => {
            event.stopPropagation();
            onAddNextSaving(row.index);
          }}
          title="Add next month saving"
        >
          <Plus size={18} />
        </button>

        <button
          type="button"
          className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.index);
          }}
          title="Edit"
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          className="rounded-md p-2 text-red-600 hover:bg-red-100"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.index);
          }}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  }),
];
