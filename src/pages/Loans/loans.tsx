import DataTable from "@/component/Table/datatable";
import { userColumns, type Loan } from "./useColumn";
import { PlusIcon, Search } from "lucide-react";
import Input from "@/component/Input/input";

function Loans() {
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

    return (
        <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search loans..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Add Button */}
                <button
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-white sm:w-auto"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Loan
                </button>
            </div>
            <div>
                <DataTable columns={userColumns} data={users} />
            </div>
        </>
    )
}
export default Loans;