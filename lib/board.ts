import "server-only";

import { getPublicClient } from "@/lib/supabase";
import { getAdminClient, IMAGE_BUCKET } from "@/lib/supabase-admin";
import { SUBMISSION_EXTENSIONS, SUBMISSION_MAX_BYTES, SUBMISSION_MAX_FILES } from "@/lib/submission-rules";
import type { Item } from "@/lib/types";

/* 게시판 공용 도우미 — 공지사항(/notice), 자료실(/study/materials) 등
   - 글은 items 표에 section 이름으로 저장 (예: 'notice', 'materials')
   - 첨부 파일은 공개 저장 공간(images)의 폴더(예: notices/, materials/)에 — 글을 보는 누구나 내려받을 수 있음
   - 누가 쓸 수 있는지는 각 게시판의 actions.ts 에서 먼저 확인한 뒤 이 함수들을 부름 */

export type BoardTicket = { ok: true; path: string; token: string } | { ok: false; message: string };
export type BoardResult = { ok: boolean; message: string };
export type BoardFileInput = { path: string; name: string; size: number; type: string };

const extOf = (name: string) => (name.split(".").pop() ?? "").toLowerCase();

/** 게시판 글 목록 (사이트에 보이는 것만, 최신순) */
export async function getBoardItems(section: string): Promise<Item[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("section", section)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error(`[getBoardItems:${section}] Supabase 읽기 실패:`, error.message);
    return [];
  }
  return (data ?? []) as Item[];
}

/** 첨부 파일 하나를 올릴 1회용 주소 */
export async function prepareBoardUpload(folder: string, file: { name: string; size: number }): Promise<BoardTicket> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "지금은 올릴 수 없어요. (Supabase 연결 필요)" };

  const ext = extOf(file.name);
  if (!SUBMISSION_EXTENSIONS.includes(ext)) return { ok: false, message: `'${file.name}' 은(는) 올릴 수 없는 파일 종류예요.` };
  if (file.size > SUBMISSION_MAX_BYTES) return { ok: false, message: `'${file.name}' 이(가) 20MB보다 커요.` };

  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { data, error } = await supabase.storage.from(IMAGE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, message: `업로드 준비 실패: ${error?.message ?? "알 수 없는 오류"}` };
  return { ok: true, path: data.path, token: data.token };
}

/** 게시판 글 저장 (바로 사이트에 보임) */
export async function createBoardItem({
  section,
  folder,
  author,
  memberId,
  input,
}: {
  section: string;
  folder: string;
  author: string;
  memberId: string | null;
  input: { title: string; content: string; files: BoardFileInput[] };
}): Promise<BoardResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "지금은 저장할 수 없어요. (Supabase 연결 필요)" };

  const title = input.title.trim().slice(0, 100);
  const content = input.content.trim().slice(0, 5000);
  if (!title) return { ok: false, message: "제목을 적어 주세요." };
  if (input.files.length > SUBMISSION_MAX_FILES) return { ok: false, message: `파일은 ${SUBMISSION_MAX_FILES}개까지 첨부할 수 있어요.` };

  // 첨부 파일이 이 게시판 폴더에 진짜 올라갔는지 확인
  const files = input.files.filter((f) => f.path.startsWith(`${folder}/`) && !f.path.slice(folder.length + 1).includes("/"));
  if (files.length !== input.files.length) return { ok: false, message: "파일 정보가 올바르지 않아요." };
  for (const f of files) {
    const name = f.path.slice(folder.length + 1);
    const { data } = await supabase.storage.from(IMAGE_BUCKET).list(folder, { search: name });
    if (!data?.some((o) => o.name === name)) return { ok: false, message: "파일이 아직 다 올라가지 않았어요. 다시 시도해 주세요." };
  }

  const attachments = files.map((f) => ({
    path: f.path,
    name: f.name.replace(/[\\/]/g, "").slice(0, 120) || "file",
    size: Math.max(0, Number(f.size) || 0),
    type: String(f.type ?? "").slice(0, 100),
    url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(f.path).data.publicUrl,
  }));

  const { error } = await supabase.from("items").insert({
    section,
    title,
    description: content || null,
    attachments,
    author,
    member_id: memberId,
    is_visible: true,
    sort_order: 0,
  });
  if (error) {
    return { ok: false, message: `저장 실패: ${error.message} (supabase/schema.sql 을 SQL Editor 에서 다시 실행했는지 확인하세요)` };
  }
  return { ok: true, message: "" };
}
