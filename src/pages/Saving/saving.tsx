import DataTable from "@/component/Table/datatable";
import { userColumns, type Saving } from "./useColumn";
import { PlusIcon, Search } from "lucide-react";

function Savings() {
  const users: Saving[] = [
  {
    sn: 1,
    name: "John Smith",
    date: "2026-08-01",
    description: "Monthly Saving",
    newMember: 2,
    fineIn: 100,
    fineOut: 20,
    payment: 5000,
    received: 3000,
  },
  {
    sn: 2,
    name: "Alice Johnson",
    date: "2026-08-02",
    description: "Loan Installment",
    newMember: 1,
    fineIn: 0,
    fineOut: 50,
    payment: 4200,
    received: 2500,
  },
  {
    sn: 3,
    name: "Michael Brown",
    date: "2026-08-03",
    description: "Emergency Fund",
    newMember: 0,
    fineIn: 150,
    fineOut: 0,
    payment: 3800,
    received: 2000,
  },
  {
    sn: 4,
    name: "Emma Wilson",
    date: "2026-08-04",
    description: "Monthly Saving",
    newMember: 3,
    fineIn: 50,
    fineOut: 10,
    payment: 6000,
    received: 3500,
  },
  {
    sn: 5,
    name: "David Miller",
    date: "2026-08-05",
    description: "Festival Contribution",
    newMember: 1,
    fineIn: 0,
    fineOut: 30,
    payment: 4500,
    received: 2800,
  },
  {
    sn: 6,
    name: "Sophia Davis",
    date: "2026-08-06",
    description: "Monthly Saving",
    newMember: 2,
    fineIn: 80,
    fineOut: 0,
    payment: 5200,
    received: 3100,
  },
  {
    sn: 7,
    name: "James Anderson",
    date: "2026-08-07",
    description: "Education Fund",
    newMember: 0,
    fineIn: 0,
    fineOut: 40,
    payment: 4700,
    received: 2700,
  },
  {
    sn: 8,
    name: "Olivia Thomas",
    date: "2026-08-08",
    description: "Monthly Saving",
    newMember: 1,
    fineIn: 120,
    fineOut: 0,
    payment: 5500,
    received: 3200,
  },
  {
    sn: 9,
    name: "William Jackson",
    date: "2026-08-09",
    description: "Health Fund",
    newMember: 2,
    fineIn: 60,
    fineOut: 15,
    payment: 4900,
    received: 2900,
  },
  {
    sn: 10,
    name: "Ava White",
    date: "2026-08-10",
    description: "Monthly Saving",
    newMember: 1,
    fineIn: 0,
    fineOut: 25,
    payment: 5100,
    received: 3000,
  },
  {
    sn: 11,
    name: "Benjamin Harris",
    date: "2026-08-11",
    description: "Loan Repayment",
    newMember: 0,
    fineIn: 200,
    fineOut: 0,
    payment: 6200,
    received: 3800,
  },
  {
    sn: 12,
    name: "Charlotte Martin",
    date: "2026-08-12",
    description: "Monthly Saving",
    newMember: 2,
    fineIn: 100,
    fineOut: 20,
    payment: 5300,
    received: 3300,
  },
  {
    sn: 13,
    name: "Daniel Thompson",
    date: "2026-08-13",
    description: "Building Fund",
    newMember: 1,
    fineIn: 0,
    fineOut: 35,
    payment: 4600,
    received: 2600,
  },
  {
    sn: 14,
    name: "Mia Garcia",
    date: "2026-08-14",
    description: "Monthly Saving",
    newMember: 3,
    fineIn: 75,
    fineOut: 0,
    payment: 5800,
    received: 3400,
  },
  {
    sn: 15,
    name: "Ethan Martinez",
    date: "2026-08-15",
    description: "Community Fund",
    newMember: 1,
    fineIn: 50,
    fineOut: 10,
    payment: 5000,
    received: 2950,
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