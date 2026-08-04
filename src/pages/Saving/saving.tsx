import DataTable from "@/component/Table/datatable";
import { userColumns, type Saving } from "./useColumn";

function Savings() {
  const users: Saving[] = [
    {
      sn: 1,
      name: "John",
      date: "2026-08-04",
      description: "Monthly Saving",
      newMember: 2,
      fineIn: 100,
      fineOut: 50,
      payment: 5000,
      received: 3000,
    },
    {
      sn: 2,
      name: "Alice",
      date: "2026-08-05",
      description: "Monthly Saving",
      newMember: 1,
      fineIn: 0,
      fineOut: 20,
      payment: 4500,
      received: 2500,
    },
  ];

  return (
    <div>
      <DataTable columns={userColumns} data={users} />
    </div>
  );
}

export default Savings;