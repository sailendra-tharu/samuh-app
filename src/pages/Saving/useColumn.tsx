import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export type Saving = {
  sn: number;
  name: string;
  date: string;
  description: string;
  newMember: number;
  fineIn: number;
  fineOut: number;
  payment: number;
  received: number;
};

// AD to BS conversion utility
const adToBs = (date: Date): { year: number; month: number; day: number } => {
  const bsBase = 2000;
  const adBase = new Date(1943, 3, 14);
  const baseAd = adBase.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const daysDiff = Math.floor((date.getTime() - baseAd) / oneDayMs);

  const bsMonthDays = [31, 32, 31, 32, 31, 30, 29, 30, 31, 30, 31, 30];

  let bsYear = bsBase;
  let remainingDays = daysDiff;

  while (remainingDays >= 365) {
    const isLeap = (bsYear + 56) % 4 === 0 ? 1 : 0;
    const daysInYear = 365 + isLeap;
    if (remainingDays >= daysInYear) {
      remainingDays -= daysInYear;
      bsYear++;
    } else {
      break;
    }
  }

  let bsMonth = 1;
  let bsDay = remainingDays + 1;

  for (let i = 0; i < 12; i++) {
    if (bsDay <= bsMonthDays[i]) {
      bsMonth = i + 1;
      break;
    }
    bsDay -= bsMonthDays[i];
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
};

const formatDateToBS = (dateString: string): string => {
  const bsMonthNames = [
    "Baishakh",
    "Jyaishtha",
    "Aashadh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];

  if (!dateString) return "";

  const date = new Date(dateString);
  const bs = adToBs(date);

  return `${bs.day} ${bsMonthNames[bs.month - 1]} ${bs.year}`;
};

const helper = createColumnHelper<Saving>();

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
    cell: (info) => formatDateToBS(info.getValue()),
  }),

  helper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("newMember", {
    header: "New Member",
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

  helper.accessor("payment", {
    header: "Payment",
    cell: (info) => info.getValue(),
  }),

  helper.accessor("received", {
    header: "Received",
    cell: (info) => info.getValue(),
  }),

  helper.display({
    id: "action",
    header: "Action",
     size: 1,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
          onClick={() => console.log("Edit", row.original)}
          title="Edit"
        >
          <Pencil size={18} />
        </button>

        <button
          className="rounded-md p-2 text-red-600 hover:bg-red-100"
          onClick={() => console.log("Delete", row.original)}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  }),
];