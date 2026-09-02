import { supabase } from "@/lib/supabase";
import {
  defaultMemberSectionPermissions,
  isSectionKey,
  sectionDefinitions,
  type MemberSectionPermissions,
} from "@/lib/access";

type SectionAccessRow = {
  section: string;
  can_view: boolean;
  can_write: boolean;
};

export async function getMemberSectionPermissions(): Promise<MemberSectionPermissions> {
  const { data, error } = await supabase
    .from("section_access")
    .select("section, can_view, can_write");

  if (error) throw error;

  return (data as SectionAccessRow[]).reduce<MemberSectionPermissions>(
    (permissions, row) => {
      if (isSectionKey(row.section)) {
        permissions[row.section] = {
          canView: row.can_view,
          canWrite: row.can_write,
        };
      }

      return permissions;
    },
    structuredClone(defaultMemberSectionPermissions)
  );
}

export async function saveMemberSectionPermissions(
  permissions: MemberSectionPermissions
): Promise<MemberSectionPermissions> {
  const rows = sectionDefinitions.map(({ key }) => ({
    section: key,
    can_view: permissions[key].canView,
    can_write: permissions[key].canView && permissions[key].canWrite,
  }));
  const { error } = await supabase
    .from("section_access")
    .upsert(rows, { onConflict: "section" });

  if (error) throw error;

  return permissions;
}

