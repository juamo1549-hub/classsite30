"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, ImageIcon, Share2 } from "lucide-react";

import { Avatar } from "@/components/ui/window";
import { downloadUrl } from "@/lib/files";

/* 갤러리 피드의 게시물 한 개 (인스타그램처럼: 올린 사람·시각 → 사진/동영상 → 공유·다운로드 → 제목·내용)
   - 공유: 휴대폰이면 공유 창(카카오톡·문자 등), 아니면 이 게시물 주소를 복사
   - 다운로드: 사진·동영상 파일을 내 기기에 저장 */

export type FeedPost = {
  id: string;
  author: string;
  /** 글쓴이 프로필 사진 (회원이 쓴 글만, 1시간짜리 임시 주소) */
  authorPhoto: string | null;
  time: string;
  title: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: "image" | "video";
  /** 파일 이름 (확장자 제외, 예: "체육대회") */
  fileName: string | null;
  /** 확장자 (대문자, 예: "JPG") */
  fileExt: string | null;
};



export function GalleryFeedPost({
  post,
  labels,
}: {
  post: FeedPost;
  labels: { share: string; copied: string; download: string };
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    // 이 사진(게시물) 한 장만 보이는 페이지 주소
    const url = `${window.location.origin}/gallery/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content ?? post.title,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 공유 창을 닫은 경우 등 — 아무것도 안 함
    }
  }

  const actionClass =
    "inline-flex items-center gap-1.5 rounded-full border-2 bg-card px-4 py-1.5 text-sm font-bold shadow-hard-sm transition-all hover:bg-yellow active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

  return (
    <article
      id={`post-${post.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border-2 bg-card shadow-hard target:ring-4 target:ring-orange"
    >
      {/* 올린 사람 + 시각 */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar name={post.author} src={post.authorPhoto} className="size-10 bg-orange" />
        <div className="min-w-0">
          <p className="truncate font-extrabold">{post.author}</p>
          <time className="text-xs font-bold text-muted-foreground">
            {post.time}
          </time>
        </div>
      </header>

      {/* 사진 / 동영상 */}
      <div className="relative aspect-square border-y-2 bg-muted">
        {post.mediaUrl && post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            playsInline
            preload="metadata"
            className="size-full bg-foreground object-contain"
          />
        ) : post.mediaUrl ? (
          <Image
            src={post.mediaUrl}
            alt={post.title}
            fill
            sizes="(min-width: 640px) 576px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10" aria-hidden />
          </div>
        )}
      </div>

      {/* 공유 · 다운로드 */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
        <button type="button" onClick={share} className={actionClass}>
          <Share2 className="size-4" aria-hidden />
          {copied ? labels.copied : labels.share}
        </button>
        {post.mediaUrl ? (
          <a
            href={downloadUrl(
              post.mediaUrl,
              post.fileName
                ? `${post.fileName}${post.fileExt ? `.${post.fileExt.toLowerCase()}` : ""}`
                : undefined,
            )}
            download
            className={actionClass}
          >
            <Download className="size-4" aria-hidden />
            {labels.download}
          </a>
        ) : null}
      </div>

      {/* 제목 · 내용 */}
      <div className="px-4 pb-5 pt-3">
        <h2 className="text-lg font-extrabold">{post.title}</h2>
        {post.content ? (
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
            {post.content}
          </p>
        ) : null}
      </div>
    </article>
  );
}
