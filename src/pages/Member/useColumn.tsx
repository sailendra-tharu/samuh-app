import { createColumnHelper } from "@tanstack/react-table";

export type Member = {
  name: string;
  email: string;
  phone: string;
  group: string;
  joinDate: string;
};

const helper = createColumnHelper<Member>();

export const userColumns = [
  helper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("phone", {
    header: "Phone",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("group", {
    header: "Group",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("joinDate", {
    header: "Join Date",
    cell: (info) => info.getValue(),
  }),

  helper.display({
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button
          className="rounded bg-blue-500 px-3 py-1 text-white"
          onClick={() => console.log("Edit", row.original)}
        >
          Edit
        </button>

        <button
          className="rounded bg-red-500 px-3 py-1 text-white"
          onClick={() => console.log("Delete", row.original)}
        >
          Delete
        </button>
      </div>
    ),
  }),
];