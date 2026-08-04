import DataTable from "@/component/Table/datatable";
import { userColumns, type Member } from "./useColumn";

function Member() {
  const users: Member[] = [
    {
      name: "John",
      email: "john@gmail.com",
      phone: "9800000000",
      group: "A",
      joinDate: "2026-08-04",
    },
    {
      name: "Alice",
      email: "alice@gmail.com",
      phone: "9811111111",
      group: "B",
      joinDate: "2026-08-05",
    },
  ];

  return (
    <div>
      <DataTable columns={userColumns} data={users} />
    </div>
  );
}

export default Member;