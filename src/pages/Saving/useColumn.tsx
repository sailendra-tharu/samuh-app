import { createColumnHelper } from "@tanstack/react-table";

export type Saving = {
  sn: number;
  name: string;
  date: string;
  description: string;
  newMember: number;
  fineIn: number;
  fineOut: number;
  payment: number;
  received: number;
};

const helper = createColumnHelper<Saving>();

export const userColumns = [
  helper.accessor("sn", {
    header: "SN",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("date", {
    header: "Date",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("newMember", {
    header: "New Member",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("fineIn", {
    header: "Fine In",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("fineOut", {
    header: "Fine Out",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("payment", {
    header: "Payment",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("received", {
    header: "Received",
    cell: (info) => info.getValue(),
  }),

  helper.display({
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button
          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          onClick={() => console.log("Edit", row.original)}
        >
          Edit
        </button>

        <button
          className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          onClick={() => console.log("Delete", row.original)}
        >
          Delete
        </button>
      </div>
    ),
  }),
];