import {
  createColumnHelper,
} from "@tanstack/react-table";

export type Loan = {
  sn: number;
  name: string;
  date: string;
  description: string;
  principleAmount: number;
  fineIn: number;
  fineOut: number;
  interest: number;
  imeLoan: number;
};

const helper = createColumnHelper<Loan>();

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

  helper.accessor("principleAmount", {
    header: "Principle Amount",
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

  helper.accessor("interest", {
    header: "Interest",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("imeLoan", {
    header: "IME Loan",
    cell: (info) => info.getValue(),
  }),

  helper.display({
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button onClick={() => console.log(row.original)}>Edit</button>
        <button onClick={() => console.log(row.original)}>Delete</button>
      </div>
    ),
  }),
];