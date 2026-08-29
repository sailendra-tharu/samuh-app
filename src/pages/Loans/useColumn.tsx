import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import NepaliDate from "nepali-date-converter";

import {
  calculateRemainingFine,
  calculateRemainingRenewalInterest,
  isLoanTermExpired,
  type Loan,
} from "@/api/loan";

export type { Loan } from "@/api/loan";

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

const helper = createColumnHelper<Loan>();

export const userColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void,
  onAddPayment: (index: number) => void
) => [
  helper.display({
    id: "sn",
    header: "SN",
    cell: ({ row }) => row.index + 1,
  }),

  helper.accessor("name", {
    header: "Name",
  }),

  helper.accessor("loanDate", {
    header: "Loan Date",
    cell: ({ getValue }) => formatDateToBS(getValue()),
  }),

  helper.accessor("loanTermYears", {
    header: "Term",
    cell: ({ getValue }) => {
      const years = getValue();
      return years === null
        ? "—"
        : `${years} ${years === 1 ? "year" : "years"}`;
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
              : status === "paid"
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
    id: "renewal",
    header: "Renewal",
    cell: ({ row }) => {
      const loan = row.original;
      const renewalIsDue =
        loan.status === "active" &&
        loan.remainingPrincipal !== null &&
        loan.remainingPrincipal > 0 &&
        isLoanTermExpired(loan.loanDate, loan.loanTermYears);

      return renewalIsDue
        ? calculateRemainingRenewalInterest(
            loan.remainingPrincipal,
            loan.renewalPaid
          ).toLocaleString()
        : "0";
    },
  }),

  helper.accessor("renewalPaid", {
    header: "Renewal Paid",
    cell: ({ getValue }) => getValue().toLocaleString(),
  }),

  helper.accessor("description", {
    header: "Description",
    cell: ({ getValue }) => getValue() || "—",
  }),

  helper.accessor("principalAmount", {
    header: "Principal Amount",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("fineIn", {
    header: "Fine In",
    cell: ({ row }) =>
      calculateRemainingFine(row.original.fineIn, row.original.fineOut).toLocaleString(),
  }),

  helper.accessor("fineOut", {
    header: "Fine Out",
    cell: ({ getValue }) => (getValue() ?? 0).toLocaleString(),
  }),

  helper.accessor("interest", {
    header: "Interest",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("emi", {
    header: "Monthly EMI",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("paidAmount", {
    header: "Paid Principal",
    cell: ({ getValue }) => formatAmount(getValue()),
  }),

  helper.accessor("remainingPrincipal", {
    id: "remainingPrincipal",
    header: "Remaining Principal",
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
            onAddPayment(row.index);
          }}
          title="Add Payment"
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
