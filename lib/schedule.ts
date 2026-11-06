import "server-only";

import { getPublicClient } from "@/lib/supabase";
import { getAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/admin-auth";
import type { ScheduleEvent, SessionMember } from "@/lib/types";

/* 학급 일정 읽기 + 일정 쓰기 권한 확인 */

/** 지난 6개월 ~ 앞으로 12개월 일정 (캘린더에서 달을 넘겨 볼 수 있게 미리 가져옴) */
export async function getEvents(): Promise<ScheduleEvent[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const { data, error } = await supabase
    .from("events")
    .select("id, category, title, starts_at, ends_at, memo, created_by")
    .gte("ends_at", new Date(now - 190 * day).toISOString())
    .lte("starts_at", new Date(now + 380 * day).toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[getEvents] Supabase 읽기 실패:", error.message);
    return [];
  }
  return (data ?? []) as ScheduleEvent[];
}

/** 일정을 쓰고 고칠 수 있는 사람인지: 관리자(로그인) 또는 '일정 권한'을 받은 승인 회원 */
export async function getScheduleEditor(
  member: SessionMember | null
): Promise<{ allowed: boolean; name: string; memberId: string | null }> {
  if (await isAdmin()) return { allowed: true, name: "관리자", memberId: null };
  if (!member || member.status !== "approved") return { allowed: false, name: "", memberId: null };

  const supabase = getAdminClient();
  if (!supabase) return { allowed: false, name: "", memberId: null };
  const { data, error } = await supabase
    .from("members")
    .select("can_edit_schedule")
    .eq("id", member.id)
    .maybeSingle();
  // 아직 can_edit_schedule 칸을 안 만들었으면(SQL 미실행) 권한 없음으로
  if (error || !data?.can_edit_schedule) return { allowed: false, name: "", memberId: null };
  return { allowed: true, name: member.name, memberId: member.id };
}
