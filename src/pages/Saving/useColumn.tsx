import { createColumnHelper } from "@tanstack/react-table";

const helper = createColumnHelper();

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

  helper.accessor("new-member", {
    header: "New Member",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("fine-in", {
    header: "Fine In",
    cell: (info) => info.getValue(),
  }),
  helper.accessor("fine-out", {
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