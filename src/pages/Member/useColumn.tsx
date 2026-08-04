import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export type Member = {
  name: string;
  email: string;
  phone: string;
  group: string;
  joinDate: string;
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

const helper = createColumnHelper<Member>();

export const userColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void
) => [
  // S.N Column
  helper.display({
    id: "sn",
    header: "S.N",
    cell: ({ row }) => row.index + 1,
  }),

  helper.accessor("name", {
    header: "Name",
  }),

  helper.accessor("email", {
    header: "Email",
  }),

  helper.accessor("phone", {
    header: "Phone",
  }),

  helper.accessor("group", {
    header: "Group",
  }),

  helper.accessor("joinDate", {
    header: "Join Date",
    cell: ({ getValue }) => formatDateToBS(getValue()),
  }),

  helper.display({
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <button
          onClick={() => onEdit(row.index)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => onDelete(row.index)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  }),
];