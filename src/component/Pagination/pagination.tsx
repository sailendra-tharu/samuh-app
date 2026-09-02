type PaginationProps = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(Math.max(currentPage, 1), pageCount);
  const firstItem = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const lastItem = Math.min(activePage * pageSize, totalItems);

  return (
    <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing {firstItem} to {lastItem} of {totalItems.toLocaleString()}
      </p>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        <button
          type="button"
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage === 1}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={activePage === page ? "page" : undefined}
              className={`rounded-md border px-3 py-1 text-sm transition ${
                activePage === page
                  ? "border-[#006b45] bg-[#006b45] text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage === pageCount}
          className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
