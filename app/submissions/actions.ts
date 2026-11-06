"use server";

/* To teacher! 선생님께 보내기 (서버에서 실행)
   - 가입이 승인된 회원만 보낼 수 있음
   - 보낸 글은 선생님(관리자 페이지 'To teacher!' 탭)과 보낸 학생 본인(마이페이지)만 볼 수 있음
   - 파일은 브라우저 → 잠긴 저장 공간(submissions)으로 바로 올라감 (1회용 업로드 주소)
     저장 위치는 "회원번호/…" 폴더라, 다른 학생의 파일과 섞이지 않음 */

import { revalidatePath } from "next/cache";

import { siteConfig } from "@/site.config";
import { getAdminClient } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/member-auth";
import {
  SUBMISSION_BUCKET,
  SUBMISSION_EXTENSIONS,
  SUBMISSION_MAX_BYTES,
  SUBMISSION_MAX_FILES,
} from "@/lib/submission-rules";
import type { SubmissionFile } from "@/lib/types";

const t = siteConfig.toTeacher;

async function approvedMember() {
  const member = await getCurrentMember();
  if (!member) return { member: null, message: t.loginRequiredText };
  if (member.status !== "approved") return { member: null, message: t.pendingText };
  return { member, message: "" };
}

const extOf = (name: string) => (name.split(".").pop() ?? "").toLowerCase();

export type UploadTicket =
  | { ok: true; path: string; token: string }
  | { ok: false; message: string };

/** 파일 하나를 올릴 1회용 주소 받기 */
export async function prepareSubmissionUpload(file: { name: string; size: number }): Promise<UploadTicket> {
  const { member, message } = await approvedMember();
  if (!member) return { ok: false, message };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "지금은 올릴 수 없어요. (Supabase 연결 필요)" };

  const ext = extOf(file.name);
  if (!SUBMISSION_EXTENSIONS.includes(ext)) {
    return { ok: false, message: `'${file.name}' 은(는) 올릴 수 없는 파일 종류예요.` };
  }
  if (file.size > SUBMISSION_MAX_BYTES) return { ok: false, message: `'${file.name}' 이(가) 20MB보다 커요.` };

  const path = `${member.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { data, error } = await supabase.storage.from(SUBMISSION_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, message: `업로드 준비 실패: ${error?.message ?? "알 수 없는 오류"}` };
  return { ok: true, path: data.path, token: data.token };
}

export type SendResult = { ok: boolean; message: string };

/** 선생님께 보내기 */
export async function sendSubmission(input: {
  title: string;
  content: string;
  files: SubmissionFile[];
}): Promise<SendResult> {
  const { member, message } = await approvedMember();
  if (!member) return { ok: false, message };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "지금은 보낼 수 없어요. (Supabase 연결 필요)" };

  const title = input.title.trim().slice(0, 100);
  const content = input.content.trim().slice(0, 5000);
  if (!title) return { ok: false, message: "제목을 적어 주세요." };
  if (input.files.length > SUBMISSION_MAX_FILES) {
    return { ok: false, message: `파일은 ${SUBMISSION_MAX_FILES}개까지 올릴 수 있어요.` };
  }

  // 파일: 내 폴더에 진짜 올라갔는지 확인
  const myFolder = `${member.id}/`;
  const files = input.files.filter((f) => f.path.startsWith(myFolder) && !f.path.slice(myFolder.length).includes("/"));
  if (files.length !== input.files.length) return { ok: false, message: "파일 정보가 올바르지 않아요." };
  if (files.length > 0) {
    const { data: listed } = await supabase.storage.from(SUBMISSION_BUCKET).list(member.id, { limit: 1000 });
    const exists = new Set((listed ?? []).map((o) => `${myFolder}${o.name}`));
    if (files.some((f) => !exists.has(f.path))) {
      return { ok: false, message: "파일이 아직 다 올라가지 않았어요. 다시 시도해 주세요." };
    }
  }

  const { error } = await supabase.from("submissions").insert({
    member_id: member.id,
    title,
    content: content || null,
    files: files.map((f) => ({
      path: f.path,
      name: f.name.replace(/[\\/]/g, "").slice(0, 120) || "file",
      size: Math.max(0, Number(f.size) || 0),
      type: String(f.type ?? "").slice(0, 100),
    })),
  });
  if (error) {
    return { ok: false, message: `보내기 실패: ${error.message} (supabase/schema.sql 을 SQL Editor 에서 다시 실행했는지 확인하세요)` };
  }

  revalidatePath("/admin");
  return { ok: true, message: t.sendDoneText };
}
