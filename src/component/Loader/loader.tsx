export default function Loader() {
  return (
    <div className="flex items-center justify-center py-6">

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