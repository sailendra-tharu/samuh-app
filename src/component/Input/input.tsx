import type { InputProps } from "./input.type"

function Input({ label, icon, rightElement, ...inputProps }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
            {icon}
          </span>
        )}
        <input
          {...inputProps}
          className={`h-12 w-full rounded-md border border-slate-300 bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${icon ? "pl-12" : "pl-4"} ${rightElement ? "pr-12" : "pr-4"}`}
        />
        {rightElement && (
          <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
            {rightElement}
          </span>
        )}
      </div>
    </div>
  );
}

export default Input;
