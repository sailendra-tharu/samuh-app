import { useState } from "react";

import DataTable from "@/component/Table/datatable";
import { userColumns, type Member } from "./useColumn";

import { PlusIcon, Search } from "lucide-react";

import Modal from "@/component/Modal/modal";
import MemberForm from "./memberModal";

import { useMembers, useSearchMembers } from "@/hook/member";

import DeleteModal from "@/component/Modal/deleteModal";

import Loader from "@/component/Loader/loader";



function Member() {
    const [open, setOpen] = useState(false);

    const [openDelete, setOpenDelete] = useState(false);


    const [editingIndex, setEditingIndex] =
        useState<number | null>(null);


    const [deleteId, setDeleteId] =
        useState<number | null>(null);


    const [search, setSearch] = useState("");

    const [saveError, setSaveError] = useState("");





    const {
        members,
        createMember,
        updateMember,
        deleteMember,
    } = useMembers();




    const {
        members: searchedMembers,
        isLoading: isSearching,
    } = useSearchMembers(search);






    // Show searched data when search exists
    const displayMembers =
        search.trim()
            ? searchedMembers
            : members;






    const saveMember = async (member: Member) => {
        setSaveError("");

        try {
            if (editingIndex !== null) {
                await updateMember(member);
            } else {
                await createMember(member);
            }

            setOpen(false);
            setEditingIndex(null);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to save member. Please try again.";

            console.error("Save member error:", error);
            setSaveError(message);
            throw error;
        }
    };








    const editMember = (index: number) => {


        setEditingIndex(index);


        setOpen(true);

    };







    const handleDeleteClick = (index: number) => {


        const member = displayMembers[index];


        setDeleteId(member.id);


        setOpenDelete(true);

    };








    const confirmDelete = () => {


        if (deleteId !== null) {


            deleteMember(deleteId);

        }


        setOpenDelete(false);


        setDeleteId(null);

    };









    return (

        <>


            {/* Search + Add Button */}

            <div
                className="
                    mb-4
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:justify-end
                "
            >




                {/* Search */}

                <div
                    className="
                        relative
                        w-full
                        sm:w-72
                    "
                >


                    <Search

                        className="
                            absolute
                            left-3
                            top-1/2
                            h-4
                            w-4
                            -translate-y-1/2
                            text-gray-500
                        "

                    />



                    <input

                        type="text"

                        value={search}


                        onChange={(e) =>
                            setSearch(e.target.value)
                        }


                        placeholder="Search members..."


                        className="
                            w-full
                            rounded-md
                            border
                            py-2
                            pl-10
                            pr-4
                            outline-none
                            focus:border-green-600
                        "

                    />


                </div>









                {/* Add Member Button */}

                <button

                    onClick={() => {

                        setEditingIndex(null);

                        setSaveError("");

                        setOpen(true);

                    }}


                    className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-md
                        bg-green-700
                        px-4
                        py-2
                        text-white
                        hover:bg-green-800
                        sm:w-auto
                    "

                >

                    <PlusIcon size={18}/>


                    Add Member


                </button>



            </div>









            {/* Table */}


            <DataTable


                columns={

                    userColumns(
                        editMember,
                        handleDeleteClick
                    )

                }


                data={displayMembers}


                isLoading={isSearching}


                loader={<Loader />}


            />









            {/* Add / Edit Modal */}


            <Modal


                isOpen={open}


                    onClose={() => {

                        setOpen(false);

                        setEditingIndex(null);

                        setSaveError("");

                }}


                title={

                    editingIndex !== null

                        ? "Edit Member"

                        : "Add Member"

                }


            >


                <MemberForm


                    onSubmit={saveMember}


                    onCancel={() => {

                        setOpen(false);

                        setEditingIndex(null);

                        setSaveError("");

                    }}


                    initialData={

                        editingIndex !== null

                            ? displayMembers[editingIndex]

                            : undefined

                    }

                    error={saveError}


                />


            </Modal>









            {/* Delete Modal */}


            <DeleteModal


                open={openDelete}


                title="Delete Member"


                message="Are you sure you want to delete this member?"


                onClose={() => {

                    setOpenDelete(false);

                }}


                onConfirm={confirmDelete}


            />



        </>

    );

}



export default Member;
