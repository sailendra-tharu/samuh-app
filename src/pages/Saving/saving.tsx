import { useState } from "react";
import { Download, PlusIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import DataTable from "@/component/Table/datatable";
import DeleteModal from "@/component/Modal/deleteModal";
import Loader from "@/component/Loader/loader";
import Modal from "@/component/Modal/modal";
import { useSavings, useSearchSavings } from "@/hook/saving";
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

function Savings() {
  const navigate = useNavigate();
  const currentBS = NepaliDate.now();
  const currentYear = currentBS.getYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentBS.getMonth());
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState("");

  const {
    savings,
    isLoading,
    createSaving,
    updateSaving,
    deleteSaving,
  } = useSavings();

  const {
    savings: searchedSavings,
    isLoading: isSearching,
  } = useSearchSavings(search);

  const monthOptions = getMonthOptions(selectedYear);
  const yearOptions = getYearOptions(currentYear);
  const selectedMonthKey = monthOptions[selectedMonth]?.key;
  const savingsForSelectedSearch = search.trim() ? searchedSavings : savings;
  const displaySavings = selectedMonthKey
    ? savingsForSelectedSearch.filter(
        (saving) => getBSMonthKey(saving.date) === selectedMonthKey
      )
    : [];

  const exportSavings = () => {
    if (!selectedMonthKey || displaySavings.length === 0) return;

    printPdf(
      `Savings - ${selectedMonthKey}`,
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
    setSaveError("");

    try {
      if (editingIndex !== null) {
        await updateSaving(saving);
      } else {
        await createSaving(saving);
      }

      setOpen(false);
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
    setEditingIndex(index);
    setSaveError("");
    setOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    const saving = displaySavings[index];

    if (saving?.id === undefined) return;

    setDeleteId(saving.id);
    setOpenDelete(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteSaving(deleteId);
    }

    setOpenDelete(false);
    setDeleteId(null);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingIndex(null);
    setSaveError("");
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
        <div className="relative w-full sm:w-72">
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
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-28 sm:flex-none"
            aria-label="Savings year"
          >
            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-36 sm:flex-none"
            aria-label="Savings month"
          >
            {monthOptions.map((month) => (
              <option key={month.key} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingIndex(null);
            setSaveError("");
            setOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800 sm:w-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Saving
        </button>
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
        columns={userColumns(editSaving, handleDeleteClick)}
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
        isOpen={open}
        onClose={closeForm}
        title={editingIndex !== null ? "Edit Saving" : "Add Saving"}
        bodyClassName="max-h-[80vh]"
        bodyScrollable
      >
        <SavingForm
          onSubmit={saveSaving}
          onCancel={closeForm}
          initialData={
            editingIndex !== null
              ? displaySavings[editingIndex]
              : undefined
          }
          error={saveError}
        />
      </Modal>

      <DeleteModal
        open={openDelete}
        title="Delete Saving"
        message="Are you sure you want to delete this saving?"
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default Savings;
