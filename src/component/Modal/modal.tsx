import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  bodyClassName?: string;
  bodyScrollable?: boolean;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  bodyClassName = "max-h-[70vh]",
  bodyScrollable = true,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div
          data-modal-header
          className="relative z-[1060] flex items-center justify-between border-b bg-gray-50 px-6 py-4 bg-green-700 text-white"
        >
          <h2 className="text-xl font-semibold text-gray-800 text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          className={`${bodyScrollable ? "overflow-y-auto" : "overflow-visible"} p-6 ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
