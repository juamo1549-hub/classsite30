import "server-only";

import { siteConfig } from "@/site.config";
import { getPublicClient } from "@/lib/supabase";
import { getMemberProfiles } from "@/lib/members";
import { splitFileName } from "@/lib/files";
import type { Item } from "@/lib/types";
import type { FeedPost } from "@/components/sections/gallery-feed-post";

/* 갤러리 게시물을 화면용(FeedPost)으로 바꾸기 — 갤러리 피드(/gallery)와 사진 한 장 페이지(/gallery/[id])에서 함께 씀 */

/** 갤러리 게시물이 저장되는 섹션 (관리자의 '갤러리' 탭) */
export const GALLERY_SECTION = "features";

export async function toFeedPosts(items: Item[]): Promise<FeedPost[]> {
  // 회원이 쓴 글은 실명 + 작은 프로필 사진
  const profiles = await getMemberProfiles(items.map((item) => item.member_id ?? ""));

  return items.map((item) => {
    const profile = item.member_id ? profiles.get(item.member_id) : undefined;
    // 파일 이름: 올릴 때의 원래 이름, 없으면 저장된 파일 이름
    const full =
      item.file_name || (item.image_url ? decodeURIComponent(item.image_url.split("/").pop() ?? "") : "");
    const { name, ext } = splitFileName(full);
    return {
      id: item.id,
      author: profile?.name || item.author?.trim() || siteConfig.galleryPage.anonymous,
      authorPhoto: profile?.photoUrl ?? null,
      // 시각은 서버에서 한국 시간으로 미리 글자로 만들어 둠 (예: "11월 6일 오후 3:20")
      time: new Date(item.created_at).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      }),
      title: item.title,
      content: item.description,
      mediaUrl: item.image_url,
      mediaType: item.media_type === "video" ? "video" : "image",
      fileName: full ? name : null,
      fileExt: full ? ext : null,
    };
  });
}

/** 갤러리 게시물 한 개 (사이트에 보이는 것만). 없으면 null */
export async function getGalleryItem(id: string): Promise<Item | null> {
  const supabase = getPublicClient();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("section", GALLERY_SECTION)
    .eq("is_visible", true)
    .maybeSingle();
  return (data as Item | null) ?? null;
}
