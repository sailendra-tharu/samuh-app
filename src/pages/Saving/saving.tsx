import DataTable from "@/component/Table/datatable";
import { userColumns } from "./useColumn";

function Savings(){
    const users = [
  {
    name: "John dasshdja sdjhajhdjhakj",
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
export default Savings;