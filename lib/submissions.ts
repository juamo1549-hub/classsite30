import "server-only";

import { getAdminClient } from "@/lib/supabase-admin";
import { SUBMISSION_BUCKET } from "@/lib/submission-rules";
import type { Submission, SubmissionView } from "@/lib/types";

/* To teacher! 제출 글 읽기
   - 관리자: 모든 글 (관리자 페이지 'To teacher!' 탭)
   - 쓴 학생 본인: 자기 글과 선생님 답글만 (마이페이지) — 다른 학생 글은 볼 수 없음
   - 파일은 잠긴 저장 공간이라, 볼 때마다 1시간짜리 내려받기 주소를 만들어 붙임 */

const URL_SECONDS = 60 * 60;

async function withFileUrls(rows: Submission[]): Promise<SubmissionView[]> {
  const supabase = getAdminClient();
  const paths = rows.flatMap((r) => (r.files ?? []).map((f) => f.path));
  const urls = new Map<string, string>();
  if (supabase && paths.length > 0) {
    const { data } = await supabase.storage.from(SUBMISSION_BUCKET).createSignedUrls(paths, URL_SECONDS);
    for (const s of data ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }
  return rows.map((r) => ({
    ...r,
    files: (r.files ?? []).map((f) => {
      const url = urls.get(f.path);
      // 내려받을 때 원래 파일 이름으로 저장되게
      return { ...f, url: url ? `${url}&download=${encodeURIComponent(f.name)}` : null };
    }),
  }));
}

/** 관리자용: 모든 제출 글 + 쓴 학생 이름·학번 (최신순) */
export async function getAllSubmissions(): Promise<{ items: SubmissionView[]; error: string | null }> {
  const supabase = getAdminClient();
  if (!supabase) return { items: [], error: "Supabase가 연결되지 않았습니다." };
  const { data, error } = await supabase
    .from("submissions")
    .select("*, members(name, student_no)")
    .order("created_at", { ascending: false });
  if (error) return { items: [], error: error.message };

  const rows = (data ?? []) as (Submission & { members: { name: string; student_no: string } | null })[];
  const views = await withFileUrls(rows.map(({ members: _m, ...r }) => (void _m, r)));
  return {
    items: views.map((v, i) => ({ ...v, author: rows[i].members ?? undefined })),
    error: null,
  };
}

/** 마이페이지용: 내가 보낸 글 + 선생님 답글 (최신순) */
export async function getMySubmissions(memberId: string): Promise<SubmissionView[]> {
  const supabase = getAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getMySubmissions]", error.message);
    return [];
  }
  return withFileUrls((data ?? []) as Submission[]);
}
