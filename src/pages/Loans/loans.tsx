import DataTable from "@/component/Table/datatable";
import { userColumns, type Loan } from "./useColumn";

function Loans(){
 const users: Loan[] = [
  {
    sn: 1,
    name: "John",
    date: "2026-08-04",
    description: "Personal Loan",
    principleAmount: 10000,
    fineIn: 100,
    fineOut: 50,
    interest: 500,
    imeLoan: 0,
  },
];

    return(
        <div>
            <DataTable columns={userColumns} data={users}/>
        </div>
    )
}
export default Loans;