import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import NepaliDate from "nepali-date-converter";

export type Member = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  group: string;
  joinDate: string;
};

const formatDateToBS = (dateString: string): string => {
  if (!dateString) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return dateString;

  const [, year, month, day] = match;

  try {
    return new NepaliDate(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).format("DD MMMM YYYY");
  } catch {
    return dateString;
  }
};

const helper = createColumnHelper<Member>();

export const userColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void
) => [
  // S.N Column
  helper.display({
    id: "sn",
    header: "S.N",
    cell: ({ row }) => row.index + 1,
  }),

  helper.accessor("name", {
    header: "Name",
  }),

  helper.accessor("email", {
    header: "Email",
  }),

  helper.accessor("phone", {
    header: "Phone",
  }),

  helper.accessor("group", {
    header: "Group",
  }),

  helper.accessor("joinDate", {
    header: "Join Date",
    cell: ({ getValue }) => formatDateToBS(getValue()),
  }),

  helper.display({
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.index);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.index);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  }),
];
