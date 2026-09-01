import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { Investment } from "@/api/investment";

export type { Investment } from "@/api/investment";

const formatAmount = (amount: number | null) =>
  amount === null ? "—" : amount.toLocaleString();

const getGainOrLoss = (investment: Investment) => {
  if (investment.investedAmount === null) {
    return null;
  }

  const value =
    investment.returnValue > 0
      ? investment.returnValue
      : investment.currentValue;

  return value === null ? null : value - investment.investedAmount;
};

const helper = createColumnHelper<Investment>();

export const userColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  onAddReturn: (index: number) => void
) => [
  helper.display({
    id: "sn",
    header: "S.N",
    cell: ({ row }) => row.index + 1,
  }),

  helper.accessor("name", {
    header: "Investment",
  }),

  helper.accessor("type", {
    header: "Type",
    cell: ({ getValue }) => getValue() || "—",
  }),

  helper.accessor("investedAmount", {
    header: "Invested Amount",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("currentValue", {
    header: "Current Value",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("returnValue", {
    header: "Returned",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.display({
    id: "gainOrLoss",
    header: "Gain / Loss",
    cell: ({ row }) => {
      const value = getGainOrLoss(row.original);

      return (
        <span
          className={
            value === null
              ? "text-gray-500"
              : value >= 0
                ? "font-medium text-green-600"
                : "font-medium text-red-600"
          }
        >
          {value === null
            ? "—"
            : `${value >= 0 ? "+" : ""}${value.toLocaleString()}`}
        </span>
      );
    },
  }),

  helper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      const label = status.charAt(0).toUpperCase() + status.slice(1);

      return (
        <span
          className={
            status === "active"
              ? "font-medium text-amber-600"
              : status === "completed"
                ? "font-medium text-green-600"
                : "font-medium text-blue-600"
          }
        >
          {label}
        </span>
      );
    },
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
            onAddReturn(row.index);
          }}
          title="Record Return"
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
