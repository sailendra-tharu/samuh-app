import { createColumnHelper } from "@tanstack/react-table";

const helper = createColumnHelper();

export const userColumns = [
  helper.accessor("name", {
    header: "Name",
    cell: info => info.getValue(),
  }),
  helper.accessor("email", {
    header: "Email",
    cell: info => info.getValue(),
  }),
];