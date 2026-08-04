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

  columns: ColumnDef<TData, any>[];

  data: TData[];

  isLoading?: boolean;

  loader?: ReactNode;

}



function DataTable<TData>({

  columns,

  data,

  isLoading = false,

  loader,

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

    <div>




      {/* Table */}

      <div
        className="
          overflow-x-auto
          rounded-lg
          border
          border-gray-300
          bg-white
          shadow-sm
        "
      >



        <table
          className="
            min-w-full
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
                          border
                          border-gray-300
                          px-6
                          py-3
                          text-left
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


                table.getRowModel().rows.map((row) => (


                  <tr

                    key={row.id}

                    className="
                      transition-colors
                      hover:bg-gray-50
                    "

                  >



                    {
                      row.getVisibleCells().map((cell) => (


                        <td

                          key={cell.id}

                          className="
                            border
                            border-gray-300
                            px-6
                            py-4
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

      <div

        className="
          mt-4
          flex
          items-center
          justify-between
        "

      >



        <div className="text-sm text-gray-600">


          Page{" "}

          {table.getState().pagination.pageIndex + 1}


          {" "}of{" "}


          {table.getPageCount() || 1}


        </div>








        <div className="flex items-center gap-2">



          <button

            className="
              rounded-md
              border
              px-3
              py-1
              disabled:opacity-50
            "

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


                className={`
                  rounded-md
                  border
                  px-3
                  py-1

                  ${
                    table.getState().pagination.pageIndex === pageIndex
                    ? "bg-[#006b45] text-white"
                    : "bg-white"
                  }

                `}

              >

                {pageIndex + 1}


              </button>


            ))
          }








          <button

            className="
              rounded-md
              border
              px-3
              py-1
              disabled:opacity-50
            "

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