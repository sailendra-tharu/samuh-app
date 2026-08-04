import DataTable from "@/component/Table/datatable";
import { userColumns, type Saving } from "./useColumn";
import { PlusIcon, Search } from "lucide-react";

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

    return (<>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input
                    type="text"
                    placeholder="Search savings..."
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Add Button */}
            <button
                className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-white sm:w-auto"
            >
                <PlusIcon className="h-4 w-4" />
                Add Saving
            </button>
        </div>
        <div>
            <DataTable columns={userColumns} data={users} />
        </div>
    </>
    );
}

export default Savings;