import "server-only";

import { getAdminClient } from "@/lib/supabase-admin";

/* 글쓴이(회원) 실명 + 프로필 사진 가져오기 (갤러리 글에 작게 표시)
   - 프로필 사진은 잠긴 저장 공간(profiles)에 있어서, 볼 때마다 1시간짜리 임시 주소를 만들어 씀
   - 이름·사진 외의 회원 정보(전화번호, 주소 등)는 절대 가져오지 않음 */

const PROFILE_BUCKET = "profiles";
const PHOTO_URL_SECONDS = 60 * 60;

export type MemberProfile = { name: string; photoUrl: string | null };

export async function getMemberProfiles(memberIds: string[]): Promise<Map<string, MemberProfile>> {
  const profiles = new Map<string, MemberProfile>();
  const ids = [...new Set(memberIds.filter(Boolean))];
  const supabase = getAdminClient();
  if (!supabase || ids.length === 0) return profiles;

  const { data, error } = await supabase.from("members").select("id, name, photo_path").in("id", ids);
  if (error || !data) return profiles;

  const { data: signed } = await supabase.storage
    .from(PROFILE_BUCKET)
    .createSignedUrls(
      data.map((m) => m.photo_path as string),
      PHOTO_URL_SECONDS
    );
  const urlByPath = new Map((signed ?? []).filter((s) => s.path).map((s) => [s.path as string, s.signedUrl]));

  for (const m of data) {
    profiles.set(m.id as string, {
      name: m.name as string,
      photoUrl: urlByPath.get(m.photo_path as string) ?? null,
    });
  }
  return profiles;
}
