import DataTable from "@/component/Table/datatable";
import { userColumns } from "./useColumn";

function member(){
    const users = [
  {
    name: "John",
    email: "john@gmail.com",
  },
  {
    name: "Alice",
    email: "alice@gmail.com",
  },
];
    return(
        <div>
            <DataTable columns={userColumns} data={users}/>
        </div>
    )
}
export default member;