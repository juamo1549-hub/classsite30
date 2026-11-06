"use server";

/* 학급 일정 추가 · 수정 · 삭제 (서버에서 실행)
   - 관리자(로그인) 또는 관리자에게 '일정 권한'을 받은 승인 회원만 할 수 있음
   - 시각은 한국 시간으로 저장 */

import { revalidatePath } from "next/cache";

import { getAdminClient } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/member-auth";
import { getScheduleEditor } from "@/lib/schedule";
import { seoulInputToIso } from "@/lib/seoul-time";
import type { EventCategory } from "@/lib/types";

export type ScheduleActionState = { ok?: boolean; message?: string };

const CATEGORIES: EventCategory[] = ["school", "exam", "assignment"];
const NO_PERMISSION = "일정은 관리자와 일정 권한을 받은 회원만 쓰고 고칠 수 있어요.";

async function editorOrNull() {
  return getScheduleEditor(await getCurrentMember());
}

export async function saveEvent(_prev: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  const editor = await editorOrNull();
  if (!editor.allowed) return { message: NO_PERMISSION };
  const supabase = getAdminClient();
  if (!supabase) return { message: "Supabase가 연결되지 않았어요." };

  const id = String(formData.get("id") ?? "");
  const category = String(formData.get("category") ?? "") as EventCategory;
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const memo = String(formData.get("memo") ?? "").trim().slice(0, 1000);
  const startsAt = seoulInputToIso(String(formData.get("starts_at") ?? ""));
  const endsAt = seoulInputToIso(String(formData.get("ends_at") ?? ""));

  if (!CATEGORIES.includes(category)) return { message: "분류를 골라 주세요." };
  if (!title) return { message: "제목을 적어 주세요." };
  if (!startsAt || !endsAt) return { message: "시작·종료 시각을 골라 주세요." };
  if (Date.parse(endsAt) < Date.parse(startsAt)) return { message: "종료 시각이 시작 시각보다 빨라요." };

  const row = {
    category,
    title,
    starts_at: startsAt,
    ends_at: endsAt,
    memo: memo || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("events").update(row).eq("id", id)
    : await supabase
        .from("events")
        .insert({ ...row, created_by: editor.name, member_id: editor.memberId });

  if (error) {
    return { message: `저장 실패: ${error.message} (supabase/schema.sql 을 SQL Editor 에서 다시 실행했는지 확인하세요)` };
  }

  revalidatePath("/");
  return { ok: true, message: id ? "일정을 고쳤어요." : "일정을 추가했어요." };
}

export async function deleteEvent(id: string): Promise<ScheduleActionState> {
  const editor = await editorOrNull();
  if (!editor.allowed) return { message: NO_PERMISSION };
  const supabase = getAdminClient();
  if (!supabase || !id) return { message: "지울 수 없어요." };

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { message: `삭제 실패: ${error.message}` };

  revalidatePath("/");
  return { ok: true, message: "일정을 지웠어요." };
}
