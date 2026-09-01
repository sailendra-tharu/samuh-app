import { CircleAlert } from "lucide-react";

type DeleteModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};


function DeleteModal({
  open,
  title = "Delete article",
  message = "Are you sure you want to delete this article?",
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteModalProps) {


  if (!open) return null;


  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-gray-900/20
      "
    >

      <div
        className="
          w-[320px]
          rounded-3xl
          bg-white
          px-8
          py-7
          text-center
          shadow-xl
        "
      >


        {/* Icon */}

        <div
          className="
            mx-auto
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-red-50
          "
        >

          <CircleAlert
            size={22}
            className="text-red-500"
          />

        </div>




        {/* Title */}

        <h2
          className="
            mt-4
            text-sm
            font-semibold
            text-gray-900
          "
        >
          {title}
        </h2>




        {/* Message */}

        <p
          className="
            mt-1
            text-[11px]
            leading-4
            text-gray-500
          "
        >
          {message}
          <br />
          This action cannot be undone.
        </p>




        {/* Buttons */}

        <div
          className="
            mt-6
            flex
            gap-2
          "
        >

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1
              rounded-md
              bg-gray-100
              py-2
              text-xs
              font-medium
              text-gray-700
              hover:bg-gray-200
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>



          <button
            type="button"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isLoading}
            className="
              flex-1
              rounded-md
              bg-red-500
              py-2
              text-xs
              font-medium
              text-white
              shadow-sm
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>


        </div>


      </div>

    </div>
  );
}


export default DeleteModal;
