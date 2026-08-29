import { useState } from "react";
import { PlusIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DataTable from "@/component/Table/datatable";
import DeleteModal from "@/component/Modal/deleteModal";
import Loader from "@/component/Loader/loader";
import Modal from "@/component/Modal/modal";
import { useLoans, useSearchLoans } from "@/hook/loan";

import LoanForm from "./loanModal";
import PaymentForm, { type LoanPaymentDraft } from "./paymentModal";
import { userColumns, type Loan } from "./useColumn";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") return message;
  }

  return fallback;
};

function Loans() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState("");
  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null);
  const [paymentError, setPaymentError] = useState("");

  const {
    loans,
    isLoading,
    createLoan,
    updateLoan,
    deleteLoan,
    createLoanPayment,
    error: loansError,
  } = useLoans();
  const {
    loans: searchedLoans,
    isLoading: isSearching,
    error: searchError,
  } = useSearchLoans(search);
  const displayLoans = search.trim() ? searchedLoans : loans;
  const loadError = search.trim() ? searchError : loansError;

  const saveLoan = async (loan: Loan) => {
    setSaveError("");

    try {
      if (editingIndex !== null) {
        await updateLoan(loan);
      } else {
        await createLoan(loan);
      }

      setOpen(false);
      setEditingIndex(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to save loan. Please try again."
      );

      console.error("Save loan error:", error);
      setSaveError(message);
      throw error;
    }
  };

  const editLoan = (index: number) => {
    setEditingIndex(index);
    setSaveError("");
    setOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    const loan = displayLoans[index];

    if (loan?.id === undefined) return;

    setDeleteId(loan.id);
    setOpenDelete(true);
  };

  const handleAddPaymentClick = (index: number) => {
    const loan = displayLoans[index];

    if (loan?.id === undefined) return;

    setPaymentError("");
    setPaymentLoan(loan);
  };

  const savePayment = async (payment: LoanPaymentDraft) => {
    if (paymentLoan?.id === undefined) return;

    setPaymentError("");

    try {
      await createLoanPayment({
        loanId: paymentLoan.id,
        paymentDate: payment.paymentDate,
        amount: payment.amount ?? 0,
        finePaid: payment.finePaid ?? 0,
        renewalPaid: payment.renewalPaid ?? 0,
      });
      setPaymentLoan(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to save payment. Please try again."
      );

      console.error("Save loan payment error:", error);
      setPaymentError(message);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      await deleteLoan(deleteId);
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search loans..."
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
          Add Loan
        </button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          Unable to load loans: {loadError.message}
        </div>
      ) : (
        <DataTable
          columns={userColumns(
            editLoan,
            handleDeleteClick,
            handleAddPaymentClick
          )}
          data={displayLoans}
          isLoading={search.trim() ? isSearching : isLoading}
          loader={<Loader />}
          onRowClick={(loan) => {
            if (loan.id !== undefined) {
              navigate(`/loans/${loan.id}`);
            }
          }}
        />
      )}

      <Modal
        isOpen={open}
        onClose={closeForm}
        title={editingIndex !== null ? "Edit Loan" : "Add Loan"}
        bodyClassName="max-h-[80vh]"
        bodyScrollable={false}
      >
        <LoanForm
          onSubmit={saveLoan}
          onCancel={closeForm}
          initialData={
            editingIndex !== null ? displayLoans[editingIndex] : undefined
          }
          error={saveError}
        />
      </Modal>

      <Modal
        isOpen={paymentLoan !== null}
        onClose={() => {
          setPaymentLoan(null);
          setPaymentError("");
        }}
        title="Add Loan Payment"
        bodyClassName="max-h-[70vh]"
        bodyScrollable={false}
      >
        {paymentLoan && (
          <PaymentForm
            loan={paymentLoan}
            onSubmit={savePayment}
            onCancel={() => {
              setPaymentLoan(null);
              setPaymentError("");
            }}
            error={paymentError}
          />
        )}
      </Modal>

      <DeleteModal
        open={openDelete}
        title="Delete Loan"
        message="Are you sure you want to delete this loan?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </>
  );
}

export default Loans;
