import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

// BS to AD conversion
const bsToAd = (bsYear: number, bsMonth: number, bsDay: number): Date => {
  const bsMonthDays = [31, 32, 31, 32, 31, 30, 29, 30, 31, 30, 31, 30];
  
  let totalDays = bsDay;
  for (let i = 0; i < bsMonth - 1; i++) {
    totalDays += bsMonthDays[i];
  }
  
  // BS 2000-01-01 is approximately AD 1943-04-14
  const bsBase = 2000;
  const adBase = new Date(1943, 3, 14);
  const baseAd = adBase.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  // Calculate days from BS 2000/1/1
  let dayCount = 0;
  for (let year = bsBase; year < bsYear; year++) {
    dayCount += 365;
    if ((year + 56) % 4 === 0) dayCount++;
  }
  
  dayCount += totalDays - 1;
  const resultDate = new Date(baseAd + dayCount * oneDayMs);
  
  return resultDate;
};

// AD to BS conversion
const adToBs = (date: Date): { year: number; month: number; day: number } => {
  // BS 2000-01-01 is approximately AD 1943-04-14
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

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBsYear, setCurrentBsYear] = useState(
    value ? adToBs(new Date(value)).year : adToBs(new Date()).year
  );
  const [currentBsMonth, setCurrentBsMonth] = useState(
    value ? adToBs(new Date(value)).month : adToBs(new Date()).month
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const bsMonthDays = [31, 32, 31, 32, 31, 30, 29, 30, 31, 30, 31, 30];
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

  const getDaysInBsMonth = () => {
    return bsMonthDays[currentBsMonth - 1];
  };

  const getFirstDayOfBsMonth = () => {
    const adDate = bsToAd(currentBsYear, currentBsMonth, 1);
    return adDate.getDay();
  };

  const handlePrevMonth = () => {
    if (currentBsMonth === 1) {
      setCurrentBsYear(currentBsYear - 1);
      setCurrentBsMonth(12);
    } else {
      setCurrentBsMonth(currentBsMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentBsMonth === 12) {
      setCurrentBsYear(currentBsYear + 1);
      setCurrentBsMonth(1);
    } else {
      setCurrentBsMonth(currentBsMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const adDate = bsToAd(currentBsYear, currentBsMonth, day);
    const formattedDate = adDate.toISOString().split("T")[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = [];
  const firstDay = getFirstDayOfBsMonth();
  const daysCount = getDaysInBsMonth();

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysCount; i++) {
    days.push(i);
  }

  const selectedBs = value ? adToBs(new Date(value)) : null;
  const isCurrentMonth =
    selectedBs &&
    selectedBs.year === currentBsYear &&
    selectedBs.month === currentBsMonth;

  const monthYear = `${bsMonthNames[currentBsMonth - 1]} ${currentBsYear}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={
            selectedBs
              ? `${selectedBs.day} ${bsMonthNames[selectedBs.month - 1]} ${selectedBs.year}`
              : ""
          }
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none pr-10"
        />
        <Calendar
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-72">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-sm font-semibold">{monthYear}</h3>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
                className={`
                  h-8 rounded text-sm font-medium
                  ${
                    !day
                      ? "text-gray-200 cursor-default"
                      : isCurrentMonth && day === selectedBs?.day
                      ? "bg-blue-500 text-white"
                      : "hover:bg-blue-100 text-gray-700"
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
