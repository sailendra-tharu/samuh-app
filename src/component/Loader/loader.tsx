type LoaderProps = {
  // "inline" sits inside a table or card, "page" keeps the sidebar and header
  // visible, and "screen" covers the whole window. "page" and "screen" both
  // centre on the window so the spinner never jumps between them.
  variant?: "inline" | "page" | "screen";
};

const wrapperClasses: Record<NonNullable<LoaderProps["variant"]>, string> = {
  inline: "flex items-center justify-center py-6",
  page: "pointer-events-none fixed inset-0 z-30 flex items-center justify-center",
  screen: "fixed inset-0 z-[9999] flex items-center justify-center bg-white",
};

export default function Loader({ variant = "inline" }: LoaderProps) {
  return (
    <div className={wrapperClasses[variant]}>

      <div className="relative h-8 w-8 animate-spin">

        <span
          className="
            absolute
            left-1/2
            top-0
            h-2
            w-2
            -translate-x-1/2
            rounded-full
            bg-blue-500
          "
        />

        <span
          className="
            absolute
            right-0
            top-1/2
            h-2
            w-2
            -translate-y-1/2
            rounded-full
            bg-blue-500
          "
        />

        <span
          className="
            absolute
            bottom-0
            left-1/2
            h-2
            w-2
            -translate-x-1/2
            rounded-full
            bg-blue-500
          "
        />

        <span
          className="
            absolute
            left-0
            top-1/2
            h-2
            w-2
            -translate-y-1/2
            rounded-full
            bg-blue-500
          "
        />

      </div>

    </div>
  );
}
