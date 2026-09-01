import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  Download,
  PlusIcon,
  Search,
  TrendingUp,
} from "lucide-react";

import type { Investment, InvestmentStatus } from "@/api/investment";
import DataTable from "@/component/Table/datatable";
import DeleteModal from "@/component/Modal/deleteModal";
import Loader from "@/component/Loader/loader";
import Modal from "@/component/Modal/modal";
import { useInvestments, useSearchInvestments } from "@/hook/investment";
import { printPdf } from "@/lib/export";

import InvestmentForm from "./investmentModal";
import ReturnForm from "./returnModal";
import { userColumns } from "./useColumn";

const money = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => `Rs ${money.format(Math.round(value))}`;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string") return message;
  }

  return fallback;
};

const getCurrentValue = (investment: Investment) =>
  investment.currentValue ?? 0;

const getGainOrLoss = (investment: Investment) =>
  (investment.returnValue > 0
    ? investment.returnValue
    : getCurrentValue(investment)) - (investment.investedAmount ?? 0);

function Investment() {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [returnInvestment, setReturnInvestment] = useState<Investment | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | "all">(
    "all"
  );
  const [saveError, setSaveError] = useState("");
  const [returnError, setReturnError] = useState("");

  const {
    investments,
    isLoading,
    error: investmentsError,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestments();
  const {
    investments: searchedInvestments,
    isLoading: isSearching,
    error: searchError,
  } = useSearchInvestments(search);

  const investmentsForSearch = search.trim() ? searchedInvestments : investments;
  const displayInvestments = useMemo(
    () =>
      investmentsForSearch.filter(
        (investment) =>
          statusFilter === "all" || investment.status === statusFilter
      ),
    [investmentsForSearch, statusFilter]
  );
  const loadError = search.trim() ? searchError : investmentsError;
  const totalInvested = investments.reduce(
    (total, investment) => total + (investment.investedAmount ?? 0),
    0
  );
  const currentValue = investments.reduce(
    (total, investment) => total + getCurrentValue(investment),
    0
  );
  const totalReturned = investments.reduce(
    (total, investment) => total + investment.returnValue,
    0
  );
  const activeInvestments = investments.filter(
    (investment) => investment.status === "active"
  ).length;

  const exportInvestments = () => {
    if (displayInvestments.length === 0) return;

    printPdf(
      "Investments",
      [
        "Investment",
        "Type",
        "Status",
        "Invested Amount",
        "Current Value",
        "Returned",
        "Gain / Loss",
      ],
      displayInvestments.map((investment) => [
        investment.name,
        investment.type,
        investment.status,
        investment.investedAmount ?? 0,
        getCurrentValue(investment),
        investment.returnValue,
        getGainOrLoss(investment),
      ])
    );
  };

  const saveInvestment = async (investment: Investment) => {
    setSaveError("");

    try {
      if (editingIndex !== null) {
        await updateInvestment(investment);
      } else {
        await createInvestment(investment);
      }

      setOpen(false);
      setEditingIndex(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to save investment. Please try again."
      );

      console.error("Save investment error:", error);
      setSaveError(message);
      throw error;
    }
  };

  const editInvestment = (index: number) => {
    setEditingIndex(index);
    setSaveError("");
    setOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    const investment = displayInvestments[index];

    if (investment?.id === undefined) return;

    setDeleteId(investment.id);
    setOpenDelete(true);
  };

  const handleAddReturn = (index: number) => {
    const investment = displayInvestments[index];

    if (!investment) return;

    setReturnError("");
    setReturnInvestment(investment);
  };

  const saveReturn = async (amount: number) => {
    if (!returnInvestment) return;

    setReturnError("");

    try {
      await updateInvestment({
        ...returnInvestment,
        returnValue: returnInvestment.returnValue + amount,
      });
      setReturnInvestment(null);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to save investment return. Please try again."
      );

      console.error("Save investment return error:", error);
      setReturnError(message);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (deleteId !== null) {
      await deleteInvestment(deleteId);
    }

    setOpenDelete(false);
    setDeleteId(null);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingIndex(null);
    setSaveError("");
  };

  const closeReturn = () => {
    setReturnInvestment(null);
    setReturnError("");
  };

  const statCards = [
    {
      label: "Total invested",
      value: formatCurrency(totalInvested),
      detail: "Capital placed across all investments",
      icon: BriefcaseBusiness,
      iconClass: "bg-[#e7f7ef] text-[#09815a]",
      accent: "#09815a",
    },
    {
      label: "Current value",
      value: formatCurrency(currentValue),
      detail: "Latest recorded value of investments",
      icon: CircleDollarSign,
      iconClass: "bg-[#e8f3ff] text-[#3679c9]",
      accent: "#3679c9",
    },
    {
      label: "Total returned",
      value: formatCurrency(totalReturned),
      detail: "Cash returned from investments",
      icon: TrendingUp,
      iconClass: "bg-[#e7f7ef] text-[#09815a]",
      accent: "#09815a",
    },
    {
      label: "Active investments",
      value: activeInvestments.toLocaleString(),
      detail: "Investments still being held",
      icon: BriefcaseBusiness,
      iconClass: "bg-[#fff4da] text-[#bf7b08]",
      accent: "#bf7b08",
    },
  ] as const;

  return (
    <div className="mx-auto min-w-0 w-full max-w-[1480px] space-y-6 pb-8">
      <section className="rounded-[24px] bg-[#103f34] px-6 py-7 text-white shadow-[0_18px_45px_-24px_rgba(16,63,52,0.8)] sm:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Investments
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100/75 sm:text-base">
              Keep every group investment organized and track how its value is
              growing over time.
            </p>
          </div>
          <p className="text-sm text-emerald-100/70">
            {investments.length.toLocaleString()} record
            {investments.length === 1 ? "" : "s"} in your portfolio
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]"
              style={{ borderTopColor: stat.accent, borderTopWidth: 3 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-[27px] font-semibold tracking-[-0.04em] text-slate-900">
                    {isLoading ? "—" : stat.value}
                  </p>
                </div>
                <span className={`rounded-xl p-3 ${stat.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 truncate text-xs text-slate-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] sm:p-6">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Portfolio records</h3>
            <p className="mt-1 text-sm text-slate-500">
              Review invested capital, current value, and returns in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search investments..."
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as InvestmentStatus | "all"
                )
              }
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Investment status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="sold">Sold</option>
            </select>

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
              Add Investment
            </button>

            <button
              type="button"
              onClick={exportInvestments}
              disabled={displayInvestments.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-green-700 px-4 py-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
            Unable to load investments: {getErrorMessage(loadError, "Unknown error")}
          </div>
        ) : (
          <DataTable
            columns={userColumns(
              editInvestment,
              handleDeleteClick,
              handleAddReturn
            )}
            data={displayInvestments}
            isLoading={search.trim() ? isSearching : isLoading}
            loader={<Loader />}
          />
        )}
      </section>

      <Modal
        isOpen={open}
        onClose={closeForm}
        title={editingIndex !== null ? "Edit Investment" : "Add Investment"}
        bodyClassName="max-h-[80vh]"
        bodyScrollable
      >
        <InvestmentForm
          onSubmit={saveInvestment}
          onCancel={closeForm}
          initialData={
            editingIndex !== null
              ? displayInvestments[editingIndex]
              : undefined
          }
          error={saveError}
        />
      </Modal>

      <Modal
        isOpen={returnInvestment !== null}
        onClose={closeReturn}
        title="Record Investment Return"
        bodyClassName="max-h-[70vh]"
        bodyScrollable
      >
        {returnInvestment && (
          <ReturnForm
            investment={returnInvestment}
            onSubmit={saveReturn}
            onCancel={closeReturn}
            error={returnError}
          />
        )}
      </Modal>

      <DeleteModal
        open={openDelete}
        title="Delete Investment"
        message="Are you sure you want to delete this investment?"
        onClose={() => setOpenDelete(false)}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </div>
  );
}

export default Investment;
