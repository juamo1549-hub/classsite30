import "server-only";

import { getAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-auth";
import { getBoardItems } from "@/lib/board";
import type { Item, SessionMember } from "@/lib/types";

/* 공지사항 읽기 + 쓰기 권한 확인
   - 공지사항은 items 표의 section = 'notice' 글 (관리자 페이지 '공지사항' 탭, '최근 7일 새 글' 창과 같은 글) */

export const NOTICE_SECTION = "notice";

/** 사이트에 보이는 공지사항 전체 (최신순) */
export async function getNotices(): Promise<Item[]> {
  return getBoardItems(NOTICE_SECTION);
}

/** 공지사항을 쓸 수 있는 사람인지: 관리자(로그인) 또는 '공지 권한'을 받은 승인 회원 */
export async function getNoticeWriter(
  member: SessionMember | null
): Promise<{ allowed: boolean; name: string; memberId: string | null }> {
  if (await isAdmin()) return { allowed: true, name: "관리자", memberId: null };
  if (!member || member.status !== "approved") return { allowed: false, name: "", memberId: null };

  const supabase = getAdminClient();
  if (!supabase) return { allowed: false, name: "", memberId: null };
  const { data, error } = await supabase
    .from("members")
    .select("can_write_notice")
    .eq("id", member.id)
    .maybeSingle();
  // 아직 can_write_notice 칸을 안 만들었으면(SQL 미실행) 권한 없음으로
  if (error || !data?.can_write_notice) return { allowed: false, name: "", memberId: null };
  return { allowed: true, name: member.name, memberId: member.id };
}
