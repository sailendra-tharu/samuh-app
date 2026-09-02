import { useState } from "react";
import { Download, PlusIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import DataTable from "@/component/Table/datatable";
import DeleteModal from "@/component/Modal/deleteModal";
import Loader from "@/component/Loader/loader";
import Modal from "@/component/Modal/modal";
import { useSavings, useSearchSavings } from "@/hook/saving";
import { useSectionAccess } from "@/hook/access";
import { printPdf } from "@/lib/export";

import SavingForm from "./savingModal";
import { userColumns, type Saving } from "./useColumn";

const getBSMonthKey = (dateString: string) =>
  new NepaliDate(new Date(dateString)).format("YYYY-MM");

const getMonthOptions = (year: number) =>
  Array.from({ length: 12 }, (_, month) => {
    const date = new NepaliDate(year, month, 1);

    return {
      value: month,
      key: date.format("YYYY-MM"),
      label: date.format("MMMM"),
    };
  });

const getYearOptions = (currentYear: number) =>
  Array.from({ length: 10 }, (_, index) => currentYear - index);

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getNextMonthDate = (dateString: string) => {
  const currentDate = new NepaliDate(new Date(dateString));
  const nextMonth = new NepaliDate(
    currentDate.getYear(),
    currentDate.getMonth(),
    1
  );

  nextMonth.setMonth(currentDate.getMonth() + 1);

  return formatLocalDate(nextMonth.toJsDate());
};

const createNextMonthSaving = (saving: Saving): Saving => ({
  ...saving,
  id: undefined,
  date: getNextMonthDate(saving.date),
  description: "",
  newMember: "",
  fineIn:
    saving.fineIn === null
      ? null
      : Math.max(0, saving.fineIn - (saving.fineOut ?? 0)),
  fineOut: 0,
  paymentReceived: null,
});

function Savings() {
  const navigate = useNavigate();
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [nextMonthSaving, setNextMonthSaving] = useState<Saving | null>(null);
  const { canWrite } = useSectionAccess();
  const canWriteSavings = canWrite("savings");

  const {
    savings,
    isLoading,
    createSaving,
    updateSaving,
    deleteSaving,
    isDeleting,
  } = useSavings();

  const {
    savings: searchedSavings,
    isLoading: isSearching,
  } = useSearchSavings(search);

  const monthOptions = getMonthOptions(selectedYear ?? currentYear);
  const yearOptions = getYearOptions(currentYear);
  const selectedMonthKey =
    selectedYear !== null && selectedMonth !== null
      ? monthOptions[selectedMonth]?.key
      : undefined;
  const savingsForSelectedSearch = search.trim() ? searchedSavings : savings;
  const displaySavings = (() => {
    if (selectedYear === null) return [];

    const filtered = savingsForSelectedSearch.filter((saving) => {
      const nepaliDate = new NepaliDate(new Date(saving.date));

      return (
        nepaliDate.format("YYYY") === String(selectedYear) &&
        (selectedMonthKey === undefined ||
          getBSMonthKey(saving.date) === selectedMonthKey)
      );
    });

    if (selectedMonthKey !== undefined) {
      return filtered;
    }

    const latestPerMember = new Map<string, typeof savingsForSelectedSearch[0]>();

    for (const saving of filtered) {
      const key = saving.memberId !== null
        ? `member_${saving.memberId}`
        : `name_${saving.name.toLowerCase()}`;

      const existing = latestPerMember.get(key);
      if (!existing) {
        latestPerMember.set(key, saving);
      } else {
        const existingDate = new Date(existing.date);
        const savingDate = new Date(saving.date);

        if (savingDate > existingDate) {
          latestPerMember.set(key, saving);
        } else if (savingDate.getTime() === existingDate.getTime()) {
          if ((saving.id ?? 0) > (existing.id ?? 0)) {
            latestPerMember.set(key, saving);
          }
        }
      }
    }

    return Array.from(latestPerMember.values()).sort((a, b) => {
      const dateOrder = b.date.localeCompare(a.date);
      return dateOrder || (b.id ?? 0) - (a.id ?? 0);
    });
  })();

  const exportSavings = () => {
    if (selectedYear === null || displaySavings.length === 0) return;

    const periodLabel = selectedMonthKey ?? `${selectedYear} - All Months`;

    printPdf(
      `Savings - ${periodLabel}`,
      [
        "Name",
        "Group Name",
        "New Member",
        "Date",
        "Description",
        "Fine In",
        "Fine Out",
        "Payment Received",
      ],
      displaySavings.map((saving) => [
        saving.name,
        saving.groupName,
        saving.newMember,
        new NepaliDate(new Date(saving.date)).format("DD MMMM YYYY"),
        saving.description,
        saving.fineIn ?? 0,
        saving.fineOut ?? 0,
        saving.paymentReceived ?? 0,
      ])
    );
  };

  const saveSaving = async (saving: Saving) => {
    if (!canWriteSavings) return;

    setSaveError("");

    try {
      if (editingIndex !== null) {
        await updateSaving(saving);
      } else {
        await createSaving(saving);
      }

      setOpen(false);
      setNextMonthSaving(null);
      setEditingIndex(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save saving. Please try again.";

      console.error("Save saving error:", error);
      setSaveError(message);
      throw error;
    }
  };

  const editSaving = (index: number) => {
    if (!canWriteSavings) return;

    setNextMonthSaving(null);
    setEditingIndex(index);
    setSaveError("");
    setOpen(true);
  };

  const addNextMonthSaving = (index: number) => {
    if (!canWriteSavings) return;

    const saving = displaySavings[index];

    if (!saving) return;

    setNextMonthSaving(createNextMonthSaving(saving));
    setEditingIndex(null);
    setSaveError("");
    setOpen(false);
  };

  const handleDeleteClick = (index: number) => {
    if (!canWriteSavings) return;

    const saving = displaySavings[index];

    if (saving?.id === undefined) return;

    setDeleteError("");
    setDeleteId(saving.id);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteSaving(deleteId);
      setOpenDelete(false);
      setDeleteId(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete saving. Please try again."
      );
    }
  };

  const closeForm = () => {
    setOpen(false);
    setNextMonthSaving(null);
    setEditingIndex(null);
    setSaveError("");
  };

  return (
    <>
      {deleteError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="relative w-full sm:w-72 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search savings..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <select
            value={selectedYear ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedYear(value ? Number(value) : null);
              setSelectedMonth(null);
            }}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-28 sm:flex-none"
            aria-label="Savings year"
          >
            <option value="">Select year</option>
            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            value={selectedMonth ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedMonth(value ? Number(value) : null);
            }}
            disabled={selectedYear === null}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-36 sm:flex-none"
            aria-label="Savings month"
          >
            <option value="">Select month</option>
            {monthOptions.map((month) => (
              <option key={month.key} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {canWriteSavings && <button
          type="button"
          onClick={() => {
            setNextMonthSaving(null);
            setEditingIndex(null);
            setSaveError("");
            setOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800 sm:w-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Saving
        </button>}
        <button
          type="button"
          onClick={exportSavings}
          disabled={displaySavings.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-green-700 px-4 py-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      <DataTable
        columns={userColumns(
          editSaving,
          handleDeleteClick,
          addNextMonthSaving,
          canWriteSavings
        )}
        data={displaySavings}
        isLoading={search.trim() ? isSearching : isLoading}
        loader={<Loader />}
        onRowClick={(saving) => {
          if (saving.memberId !== null) {
            navigate(`/savings/${saving.memberId}`);
          }
        }}
      />

      <Modal
        isOpen={open || nextMonthSaving !== null}
        onClose={closeForm}
        title={
          nextMonthSaving
            ? "Add Next Month Saving"
            : editingIndex !== null
              ? "Edit Saving"
              : "Add Saving"
        }
        bodyClassName="max-h-[80vh]"
        bodyScrollable
      >
        <SavingForm
          onSubmit={saveSaving}
          onCancel={closeForm}
          initialData={
            nextMonthSaving ??
              (editingIndex !== null
              ? displaySavings[editingIndex]
              : undefined)
          }
          variant={nextMonthSaving ? "next-month" : "default"}
          error={saveError}
        />
      </Modal>

      <DeleteModal
        open={openDelete}
        title="Delete Saving"
        message="Are you sure you want to delete this saving?"
        onClose={() => {
          setOpenDelete(false);
          setDeleteError("");
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
        isLoading={isDeleting}
      />
    </>
  );
}

export default Savings;
