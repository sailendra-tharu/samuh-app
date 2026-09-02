import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  useState,
  useEffect,
  memo,
  type ReactNode,
} from "react";


interface DataTableProps<TData> {

  // TanStack uses a value type that is intentionally flexible across accessor columns.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];

  data: TData[];

  isLoading?: boolean;

  loader?: ReactNode;

  onRowClick?: (row: TData) => void;

}



function DataTable<TData>({

  columns,

  data,

  isLoading = false,

  loader,

  onRowClick,

}: DataTableProps<TData>) {



  const [pagination, setPagination] = useState({

    pageIndex: 0,

    pageSize: 10,

  });





  useEffect(() => {

    setPagination({

      pageIndex: 0,

      pageSize: 10,

    });

  }, [data]);







  // TanStack Table manages this instance internally and intentionally returns a non-memoizable API.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({


    columns,


    data,


    state: {

      pagination,

    },


    onPaginationChange: setPagination,


    getCoreRowModel: getCoreRowModel(),


    getPaginationRowModel: getPaginationRowModel(),


    autoResetPageIndex: true,


  });







  return (

    <div className="min-w-0">




      {/* Table */}

      <div
        className="
          max-w-full
          overflow-x-auto
          overscroll-x-contain
          rounded-lg
          border
          border-gray-300
          bg-white
          shadow-sm
        "
      >



        <table
          className="
            min-w-max
            w-full
            border-collapse
            border
            border-gray-300
          "
        >




          {/* Header */}

          <thead className="bg-[#006b45] text-white">


            {
              table.getHeaderGroups().map((headerGroup) => (

                <tr key={headerGroup.id}>


                  {
                    headerGroup.headers.map((header) => (


                      <th

                        key={header.id}

                        className="
                          border-b
                          border-r
                          border-gray-100
                          px-3
                          py-3
                          text-left
                          whitespace-nowrap
                          text-sm
                          font-semibold
                        "

                      >

                        {
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        }


                      </th>


                    ))
                  }


                </tr>


              ))
            }


          </thead>








          {/* Body */}

          <tbody>



            {
              isLoading ? (

                <tr>

                  <td

                    colSpan={columns.length}

                    className="
                      border
                      border-gray-300
                      px-6
                      py-10
                      text-center
                    "

                  >


                    {
                      loader ?? (

                        <div className="flex justify-center">


                          <div

                            className="
                              h-8
                              w-8
                              animate-spin
                              rounded-full
                              border-4
                              border-gray-300
                              border-t-[#006b45]
                            "

                          />


                        </div>

                      )
                    }



                  </td>


                </tr>


              ) : (


                table.getRowModel().rows.map((row, index) => (


                  <tr

                    key={row.id}

                    className={`
                      transition-colors
                      hover:bg-gray-100
                      ${onRowClick ? "cursor-pointer" : ""}
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    `}

                    onClick={() => onRowClick?.(row.original)}

                  >



                    {
                      row.getVisibleCells().map((cell) => (


                        <td

                          key={cell.id}

                          className="
                            border-b
                            border-r
                            border-gray-100
                            px-3
                            py-4
                            whitespace-nowrap
                            text-sm
                            text-gray-700
                          "

                        >


                          {
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          }


                        </td>


                      ))
                    }



                  </tr>


                ))


              )

            }





            {
              !isLoading &&
              table.getRowModel().rows.length === 0 && (


                <tr>


                  <td

                    colSpan={columns.length}

                    className="
                      border
                      border-gray-300
                      px-6
                      py-8
                      text-center
                      text-gray-500
                    "

                  >

                    No data found.


                  </td>


                </tr>


              )
            }




          </tbody>



        </table>



      </div>









      {/* Pagination */}

      <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">



        <div className="text-sm text-slate-600">
          Showing {data.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {data.length.toLocaleString()} members
        </div>








        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">



          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>







          {
            Array.from(

              {
                length: table.getPageCount()
              },

              (_, index) => index

            ).map((pageIndex) => (


              <button

                key={pageIndex}


                onClick={() =>
                  table.setPageIndex(pageIndex)
                }


                className={`rounded-md border px-3 py-1 text-sm transition ${table.getState().pagination.pageIndex === pageIndex ? "bg-[#006b45] text-white border-[#006b45]" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}

              >

                {pageIndex + 1}


              </button>


            ))
          }








          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>



        </div>



      </div>



    </div>

  );

}



export default memo(DataTable) as typeof DataTable;
