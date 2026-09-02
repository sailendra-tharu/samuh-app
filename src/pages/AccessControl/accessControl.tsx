import { useState } from "react";
import {
  ChartNoAxesCombined,
  Check,
  HandCoins,
  LayoutDashboard,
  Save,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useSaveSectionAccess, useSectionAccess } from "@/hook/access";
import {
  sectionDefinitions,
  type MemberSectionPermissions,
  type SectionKey,
} from "@/lib/access";

const iconBySection: Record<SectionKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  members: Users,
  savings: Wallet,
  loans: HandCoins,
  investment: TrendingUp,
  "profit-loss": ChartNoAxesCombined,
};

function AccessControl() {
  const { permissions, error, isLoading } = useSectionAccess();
  const saveMutation = useSaveSectionAccess();
  const [draft, setDraft] = useState<MemberSectionPermissions | null>(null);
  const [message, setMessage] = useState("");

  const draftPermissions = draft ?? permissions;
  const hasChanges = sectionDefinitions.some(({ key }) => {
    const current = permissions[key];
    const next = draftPermissions[key];

    return current.canView !== next.canView || current.canWrite !== next.canWrite;
  });
  const errorMessage = error instanceof Error ? error.message : "";

  const updatePermission = (
    section: SectionKey,
    permission: "canView" | "canWrite"
  ) => {
    setMessage("");
    setDraft((current) => {
      const currentPermissions = current ?? permissions;
      const currentSection = currentPermissions[section];
      const nextValue = !currentSection[permission];

      return {
        ...currentPermissions,
        [section]: {
          ...currentSection,
          [permission]: nextValue,
          ...(permission === "canView" && !nextValue ? { canWrite: false } : {}),
        },
      };
    });
  };

  const handleSave = async () => {
    setMessage("");

    try {
      await saveMutation.mutateAsync(draftPermissions);
      setMessage("Member permissions have been updated.");
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update member permissions."
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-8 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[#103f34] px-4 py-5 text-white shadow-[0_18px_45px_-24px_rgba(16,63,52,0.8)] sm:rounded-[28px] sm:px-8 sm:py-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#8be5b9]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
              Member permissions
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Manage read and write access
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-100/75 sm:text-base">
              Decide which sections member accounts can open and whether they can
              add, edit, or delete records. Admin accounts always have full access.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Member access</h3>
            <p className="mt-1 text-sm text-slate-500">
              Write access is only available when read access is enabled.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isLoading || !!error || !hasChanges || saveMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#087b55] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#07583e] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>

        {error ? (
          <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 sm:m-6">
            <p className="font-semibold">Access settings are not connected yet.</p>
            <p className="mt-1 leading-6">
              Apply the section access migration in your Supabase project, then
              reload this page.
            </p>
            {errorMessage && (
              <p className="mt-2 break-words text-xs text-amber-700/80">{errorMessage}</p>
            )}
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1fr)_90px_90px] items-center gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:grid sm:px-6">
              <span>Section</span>
              <span className="text-center">Read</span>
              <span className="text-center">Write</span>
            </div>
            <div className="divide-y divide-slate-100">
              {sectionDefinitions.map((section) => {
                const Icon = iconBySection[section.key];
                const permission = draftPermissions[section.key];

                return (
                  <div
                    key={section.key}
                    className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_90px_90px] sm:items-center sm:px-6 sm:py-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9f8f0] text-[#087b55]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{section.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p>
                      </div>
                    </div>

                    <PermissionSwitch
                      label="Read"
                      checked={permission.canView}
                      onChange={() => updatePermission(section.key, "canView")}
                    />
                    <PermissionSwitch
                      label="Write"
                      checked={permission.canWrite}
                      disabled={!permission.canView}
                      onChange={() => updatePermission(section.key, "canWrite")}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {message && (
          <p
            className={`border-t px-5 py-4 text-sm sm:px-6 ${message === "Member permissions have been updated." ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-700"}`}
          >
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

type PermissionSwitchProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
};

function PermissionSwitch({
  label,
  checked,
  disabled = false,
  onChange,
}: PermissionSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3 sm:block">
      <span className="text-xs font-semibold text-slate-500 sm:hidden">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${checked ? "Disable" : "Enable"} ${label.toLowerCase()} access`}
        disabled={disabled}
        onClick={onChange}
        className={`relative mx-auto h-7 w-12 rounded-full p-1 transition ${disabled ? "cursor-not-allowed bg-slate-200" : checked ? "bg-[#087b55]" : "bg-slate-300"}`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        >
          {checked && <Check className="h-3 w-3 text-[#087b55]" />}
        </span>
      </button>
    </div>
  );
}

export default AccessControl;
