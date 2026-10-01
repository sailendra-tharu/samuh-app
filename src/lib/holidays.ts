import NepaliDate from "nepali-date-converter";

export type Holiday = {
  name: string;
  greeting: string;
};

type FixedHoliday = Holiday & {
  month: number; // 1 = Baisakh / January
  day: number;
};

type DatedHoliday = Holiday & {
  start: string; // AD date, YYYY-MM-DD
  end?: string; // last day for festivals that run several days
};

// Public holidays that fall on the same Bikram Sambat date every year.
const fixedBSHolidays: FixedHoliday[] = [
  { month: 1, day: 1, name: "Nepali New Year", greeting: "Happy New Year {year}!" },
  { month: 1, day: 11, name: "Loktantra Diwas", greeting: "Happy Democracy Day!" },
  { month: 2, day: 15, name: "Ganatantra Diwas", greeting: "Happy Republic Day!" },
  { month: 6, day: 3, name: "Sambidhan Diwas", greeting: "Happy Constitution Day!" },
  { month: 9, day: 27, name: "Prithvi Jayanti", greeting: "Happy National Unity Day!" },
  { month: 10, day: 1, name: "Maghe Sankranti", greeting: "Happy Maghe Sankranti!" },
  { month: 10, day: 16, name: "Shahid Diwas", greeting: "Remembering our martyrs." },
  { month: 11, day: 7, name: "Prajatantra Diwas", greeting: "Happy Democracy Day!" },
];

// Public holidays that fall on the same English date every year.
const fixedADHolidays: FixedHoliday[] = [
  { month: 5, day: 1, name: "Shramik Diwas", greeting: "Happy Labour Day!" },
  { month: 12, day: 25, name: "Christmas", greeting: "Merry Christmas!" },
];

// Festivals that follow the lunar calendar move every year, so add them from
// the government's official holiday list for each year, for example:
// { start: "2026-10-20", end: "2026-10-24", name: "Dashain", greeting: "Happy Dashain!" },
const datedHolidays: DatedHoliday[] = [
  // TEST ONLY: remove before release.
  { start: "2026-10-01", name: "Test Celebration", greeting: "Happy Testing Day!" },
];

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function getHoliday(date = new Date()): Holiday | null {
  const isoDate = toISODate(date);
  const dated = datedHolidays.find(
    (holiday) => isoDate >= holiday.start && isoDate <= (holiday.end ?? holiday.start)
  );

  if (dated) return dated;

  const bsDate = new NepaliDate(date);
  const bsHoliday = fixedBSHolidays.find(
    (holiday) =>
      holiday.month === bsDate.getMonth() + 1 && holiday.day === bsDate.getDate()
  );

  if (bsHoliday) {
    return {
      ...bsHoliday,
      greeting: bsHoliday.greeting.replace("{year}", String(bsDate.getYear())),
    };
  }

  return (
    fixedADHolidays.find(
      (holiday) =>
        holiday.month === date.getMonth() + 1 && holiday.day === date.getDate()
    ) ?? null
  );
}
