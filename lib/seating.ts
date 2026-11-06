import "server-only";

import { siteConfig } from "@/site.config";
import { getPublicClient } from "@/lib/supabase";
import { getAdminClient } from "@/lib/supabase-admin";
import { getMemberProfiles } from "@/lib/members";

/* 학급 자리배치도
   - 자리 정보는 site_texts 표의 'seating.layout' 한 줄에 저장 (표를 새로 만들 필요 없음)
     값: { rows, cols, seats: [회원번호 또는 null, …], updatedAt }
   - 자리에 앉는 사람 = 관리자가 가입을 승인한 회원 */

export const SEATING_KEY = "seating.layout";

export type SeatingLayout = { rows: number; cols: number; seats: (string | null)[]; updatedAt: string | null };
export type Seat = { memberId: string; name: string; photoUrl: string | null } | null;

/** 저장된 자리 정보 (없으면 빈 자리들) */
export async function getSeatingLayout(): Promise<SeatingLayout> {
  const { rows, cols } = siteConfig.seating;
  const empty: SeatingLayout = { rows, cols, seats: Array(rows * cols).fill(null), updatedAt: null };
  const supabase = getPublicClient();
  if (!supabase) return empty;

  const { data } = await supabase.from("site_texts").select("value").eq("key", SEATING_KEY).maybeSingle();
  if (!data?.value) return empty;
  try {
    const parsed = JSON.parse(data.value as string) as SeatingLayout;
    return { rows: parsed.rows, cols: parsed.cols, seats: parsed.seats ?? [], updatedAt: parsed.updatedAt ?? null };
  } catch {
    return empty;
  }
}

/** 승인된 회원 번호 목록 */
export async function getApprovedMemberIds(): Promise<string[]> {
  const supabase = getAdminClient();
  if (!supabase) return [];
  const { data } = await supabase.from("members").select("id").eq("status", "approved");
  return (data ?? []).map((m) => m.id as string);
}

/** 화면에 그릴 자리: 이름·사진을 붙이고, 승인이 취소된 회원 자리는 빈자리로 */
export async function getSeatingView() {
  const layout = await getSeatingLayout();
  const approved = new Set(await getApprovedMemberIds());
  const profiles = await getMemberProfiles(layout.seats.filter((id): id is string => !!id && approved.has(id)));

  const seats: Seat[] = layout.seats.map((id) => {
    const p = id ? profiles.get(id) : undefined;
    return id && p ? { memberId: id, name: p.name, photoUrl: p.photoUrl } : null;
  });
  // 전체 칸 수에 맞추기
  const total = layout.rows * layout.cols;
  while (seats.length < total) seats.push(null);

  // 아직 자리가 없는 승인 회원 수 (새로 가입한 친구 등)
  const seated = new Set(seats.filter(Boolean).map((s) => s!.memberId));
  const unseatedCount = [...approved].filter((id) => !seated.has(id)).length;

  return { rows: layout.rows, cols: layout.cols, seats: seats.slice(0, total), updatedAt: layout.updatedAt, unseatedCount };
}
