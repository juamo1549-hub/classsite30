"use server";

/* 갤러리 피드(/gallery)에서 회원이 게시물을 올릴 때 서버에서 하는 일
   - 관리자가 가입을 승인한 회원만 올릴 수 있음 (로그인 필요)
   1) prepareUpload : 파일 종류·크기를 확인하고, 그 파일 하나만 올릴 수 있는 '1회용 업로드 주소'를 만들어 줌
                      (파일은 브라우저 → Supabase 저장소로 바로 올라감. 큰 동영상도 가능)
   2) createPost    : 올라간 파일이 진짜 있는지 확인하고 게시물을 저장 → 관리자 승인 없이 바로 보임
                      (올린 사람 이름은 회원 정보에서 자동으로) */

import { revalidatePath } from "next/cache";

import { siteConfig } from "@/site.config";
import { getAdminClient, IMAGE_BUCKET } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/member-auth";

/** 승인된 회원인지 확인 (아니면 안내 문구) */
async function requireApprovedMember() {
  const member = await getCurrentMember();
  if (!member) return { member: null, message: siteConfig.galleryPage.loginRequiredText };
  if (member.status !== "approved") return { member: null, message: siteConfig.galleryPage.pendingText };
  return { member, message: "" };
}

const MB = 1024 * 1024;
const LIMITS = {
  image: 10 * MB, // 사진 10MB
  video: 50 * MB, // 동영상 50MB
};
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const FOLDER = "gallery";

/** 갤러리 게시물이 저장되는 섹션 (관리자의 '갤러리' 탭) */
const GALLERY_SECTION = "features";

export type UploadTicket =
  | { ok: true; path: string; token: string; mediaType: "image" | "video" }
  | { ok: false; message: string };

export async function prepareUpload(file: {
  name: string;
  type: string;
  size: number;
}): Promise<UploadTicket> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "지금은 올릴 수 없어요. (Supabase 연결 필요)" };
  const { member, message } = await requireApprovedMember();
  if (!member) return { ok: false, message };

  const mediaType = file.type.startsWith("image/")
    ? "image"
    : VIDEO_TYPES.includes(file.type)
      ? "video"
      : null;
  if (!mediaType) return { ok: false, message: "사진(jpg, png 등)이나 동영상(mp4, mov, webm)만 올릴 수 있어요." };
  if (file.size > LIMITS[mediaType]) {
    return {
      ok: false,
      message: mediaType === "video" ? "동영상은 50MB 이하만 올릴 수 있어요." : "사진은 10MB 이하만 올릴 수 있어요.",
    };
  }

  const ext = (file.name.split(".").pop() || (mediaType === "video" ? "mp4" : "jpg"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5);
  const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { data, error } = await supabase.storage.from(IMAGE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, message: `업로드 준비 실패: ${error?.message ?? "알 수 없는 오류"}` };

  return { ok: true, path: data.path, token: data.token, mediaType };
}

export type PostResult = { ok: boolean; message: string };

export async function createPost(input: {
  title: string;
  content: string;
  path: string;
  mediaType: "image" | "video";
  /** 학생 컴퓨터에 있던 원래 파일 이름 (예: 체육대회.jpg) — 리스트와 다운로드 이름에 씀 */
  originalName?: string;
}): Promise<PostResult> {
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "지금은 올릴 수 없어요. (Supabase 연결 필요)" };
  const { member, message } = await requireApprovedMember();
  if (!member) return { ok: false, message };

  const author = member.name;
  const title = input.title.trim().slice(0, 80);
  const content = input.content.trim().slice(0, 2000);
  // 원래 파일 이름에서 폴더 구분 기호(\ /)와 보이지 않는 제어 문자만 빼고 저장
  const originalName = (input.originalName ?? "").replace(/[\\/\u0000-\u001f]/g, "").trim().slice(0, 120);

  // 올라간 파일이 우리 갤러리 폴더에 진짜 있는지 확인
  const fileName = input.path.startsWith(`${FOLDER}/`) ? input.path.slice(FOLDER.length + 1) : "";
  if (!fileName || fileName.includes("/")) return { ok: false, message: "파일 정보가 올바르지 않아요." };
  const { data: found } = await supabase.storage.from(IMAGE_BUCKET).list(FOLDER, { search: fileName });
  if (!found?.some((f) => f.name === fileName)) {
    return { ok: false, message: "파일이 아직 올라가지 않았어요. 다시 시도해 주세요." };
  }

  const row = {
    section: GALLERY_SECTION,
    title: title || `${author}님의 게시물`,
    description: content || null,
    image_url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(input.path).data.publicUrl,
    media_type: input.mediaType,
    author,
    member_id: member.id,
    is_visible: true, // 승인된 회원의 글은 바로 보임
    sort_order: 0,
    file_name: originalName || null,
  };
  let { error } = await supabase.from("items").insert(row);
  // 아직 file_name 칸을 안 만들었으면(SQL 미실행) 파일 이름만 빼고 저장
  if (error?.message.includes("file_name")) {
    const { file_name: _skip, ...withoutName } = row;
    void _skip;
    ({ error } = await supabase.from("items").insert(withoutName));
  }
  if (error) {
    return {
      ok: false,
      message: `저장 실패: ${error.message} (supabase/schema.sql 을 SQL Editor 에서 다시 실행했는지 확인하세요)`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/gallery");
  return { ok: true, message: siteConfig.galleryPage.uploadDoneText };
}
