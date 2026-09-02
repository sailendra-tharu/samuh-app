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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 backdrop-blur-sm sm:p-4 sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-2rem)]"
      >
        {/* Header */}
        <div
          data-modal-header
          className="relative z-[1060] flex items-center justify-between gap-3 border-b bg-gray-50 px-4 py-3 bg-green-700 text-white sm:px-6 sm:py-4"
        >
          <h2 className="min-w-0 truncate text-lg font-semibold text-gray-800 text-white sm:text-xl">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-2 transition hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          className={`${bodyScrollable ? "min-h-0 flex-1 overflow-y-auto" : "overflow-visible"} p-4 sm:p-6 ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
