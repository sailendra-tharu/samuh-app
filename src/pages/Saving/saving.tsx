import { useState } from "react";
import { PlusIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NepaliDate from "nepali-date-converter";

import DataTable from "@/component/Table/datatable";
import DeleteModal from "@/component/Modal/deleteModal";
import Loader from "@/component/Loader/loader";
import Modal from "@/component/Modal/modal";
import { useSavings, useSearchSavings } from "@/hook/saving";

import SavingForm from "./savingModal";
import { userColumns, type Saving } from "./useColumn";

const isCurrentBSMonth = (dateString: string) => {
  const today = NepaliDate.now();
  const savingDate = new NepaliDate(new Date(dateString));

  return (
    savingDate.getYear() === today.getYear() &&
    savingDate.getMonth() === today.getMonth()
  );
};

function Savings() {
  const navigate = useNavigate();
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

  const savingsForCurrentMonth = search.trim() ? searchedSavings : savings;
  const displaySavings = savingsForCurrentMonth.filter((saving) =>
    isCurrentBSMonth(saving.date)
  );

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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
        bodyScrollable={false}
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
