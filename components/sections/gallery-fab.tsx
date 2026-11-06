"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Download,
  ImageIcon,
  ImagePlus,
  List,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/window";
import { Popup } from "@/components/ui/popup";
import { GalleryUploadForm } from "@/components/sections/gallery-upload-form";
import { downloadUrl } from "@/lib/files";
import type { SessionMember } from "@/lib/types";
import { type FeedPost } from "@/components/sections/gallery-feed-post";

/* 갤러리 피드 오른쪽 아래에 떠 있는 버튼 2개 (스크롤해도 계속 보임)
   - 위: 리스트 → 창이 뜨고 '작성자 · 제목 · 파일 다운로드' 목록. 글을 누르면 그 아래로 사진과 내용이 펼쳐짐
   - 아래: 글쓰기 → 창이 뜨고 새 게시물 올리기
   - 버튼에 마우스를 올리면 아이콘이 왼쪽으로 밀리면서 이름("리스트", "글쓰기")이 나타남
   - 글자는 site.config.ts 의 galleryPage 에서 바꿉니다. (app/gallery/page.tsx 에서 넘겨줌) */

export type GalleryFabLabels = {
  write: string;
  writeTitle: string;
  uploadHint: string;
  list: string;
  listTitle: string;
  columns: { author: string; title: string; file: string };
  download: string;
  close: string;
  emptyText: string;
  loginRequired: string;
  pending: string;
};

/** 떠 있는 동그란 버튼 (마우스를 올리면 오른쪽에 이름이 펼쳐지며 아이콘이 왼쪽으로 밀림) */
function FabButton({
  Icon,
  label,
  className,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-haspopup="dialog"
      className={cn(
        "group flex h-14 items-center rounded-full border-2 shadow-hard transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        className,
      )}
    >
      <span className="flex size-[3.25rem] shrink-0 items-center justify-center">
        <Icon className="size-6" aria-hidden />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-extrabold opacity-0 transition-all duration-300 group-hover:max-w-28 group-hover:pr-5 group-hover:opacity-100 group-focus-visible:max-w-28 group-focus-visible:pr-5 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  );
}

/** 파일 이름 + 확장자를 합친 글자 (예: "체육대회.jpg") */
function fullFileName(post: FeedPost) {
  if (!post.fileName) return null;
  return post.fileExt
    ? `${post.fileName}.${post.fileExt.toLowerCase()}`
    : post.fileName;
}

/** 리스트 창 내용: 작성자 · 제목 · 파일명(확장자, 다운로드). 글을 누르면 그 아래로 사진과 내용이 펼쳐짐 */
function PostList({
  posts,
  labels,
}: {
  posts: FeedPost[];
  labels: GalleryFabLabels;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed px-5 py-10 text-center font-medium text-muted-foreground">
        {labels.emptyText}
      </p>
    );
  }

  // 휴대폰처럼 좁은 화면에서는 파일명 글자를 숨기고 확장자 꼬리표와 다운로드 버튼만 보여줌 (이름은 펼쳤을 때 보임)
  const cols =
    "grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,13rem)]";

  return (
    <div className="overflow-hidden rounded-xl border-2">
      <div
        className={cn(
          cols,
          "border-b-2 bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground",
        )}
      >
        <span>{labels.columns.author}</span>
        <span>{labels.columns.title}</span>
        <span>{labels.columns.file}</span>
      </div>
      <ul>
        {posts.map((post) => {
          const open = openId === post.id;
          return (
            <li key={post.id} className="border-b-2 last:border-b-0">
              <div
                className={cn(
                  cols,
                  "px-4 py-3 transition-colors",
                  open ? "bg-yellow/40" : "hover:bg-muted",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                  <Avatar
                    name={post.author}
                    src={post.authorPhoto}
                    className="size-7 bg-orange text-xs"
                  />
                  <span className="truncate">{post.author}</span>
                </span>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : post.id)}
                  className="flex min-w-0 items-center gap-1.5 text-left text-sm font-extrabold"
                >
                  <span className="truncate">{post.title}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {post.mediaUrl ? (
                  <span className="flex min-w-0 items-center justify-end gap-2">
                    <span
                      className="hidden min-w-0 truncate text-sm font-medium sm:inline"
                      title={fullFileName(post) ?? undefined}
                    >
                      {post.fileName}
                    </span>
                    {post.fileExt ? (
                      <span className="shrink-0 rounded-full border-2 bg-yellow px-2 py-0.5 text-[0.65rem] font-extrabold">
                        {post.fileExt}
                      </span>
                    ) : null}
                    <a
                      href={downloadUrl(
                        post.mediaUrl,
                        fullFileName(post) ?? undefined,
                      )}
                      download
                      aria-label={`${fullFileName(post) ?? post.title} ${labels.download}`}
                      title={labels.download}
                      className="inline-flex size-9 items-center justify-center rounded-full border-2 bg-card shadow-hard-sm transition-all hover:bg-yellow active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                    >
                      <Download className="size-4" aria-hidden />
                    </a>
                  </span>
                ) : (
                  <span className="size-9" />
                )}
              </div>

              {/* 펼친 글: 사진/동영상 + 내용 (아래 글들은 자연스럽게 밀려 내려감) */}
              {open ? (
                <div className="space-y-3 border-t-2 border-dashed bg-muted/50 px-4 py-4">
                  <p className="text-xs font-bold text-muted-foreground">
                    {post.time}
                    {fullFileName(post) ? ` · ${fullFileName(post)}` : ""}
                  </p>
                  {post.mediaUrl ? (
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 bg-foreground">
                      {post.mediaType === "video" ? (
                        <video
                          src={post.mediaUrl}
                          controls
                          playsInline
                          className="size-full object-contain"
                        />
                      ) : (
                        <Image
                          src={post.mediaUrl}
                          alt={post.title}
                          fill
                          sizes="(min-width: 640px) 600px, 100vw"
                          className="object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-xl border-2 bg-card text-muted-foreground">
                      <ImageIcon className="size-8" aria-hidden />
                    </div>
                  )}
                  {post.content ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {post.content}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GalleryFab({
  posts,
  labels,
  member,
}: {
  posts: FeedPost[];
  labels: GalleryFabLabels;
  /** 로그인한 회원. 승인된 회원만 글쓰기 칸이 보이고, 아니면 안내 문구 */
  member: SessionMember | null;
}) {
  const writeRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <FabButton
          Icon={List}
          label={labels.list}
          className="bg-teal"
          onClick={() => listRef.current?.showModal()}
        />
        <FabButton
          Icon={ImagePlus}
          label={labels.write}
          className="bg-yellow"
          onClick={() => writeRef.current?.showModal()}
        />
      </div>

      <Popup
        dialogRef={listRef}
        title={labels.listTitle}
        closeLabel={labels.close}
        Icon={List}
      >
        <PostList posts={posts} labels={labels} />
      </Popup>

      <Popup
        dialogRef={writeRef}
        title={labels.writeTitle}
        closeLabel={labels.close}
        Icon={ImagePlus}
      >
        {member?.status === "approved" ? (
          <GalleryUploadForm hint={labels.uploadHint} authorName={member.name} />
        ) : (
          <p className="rounded-xl border-2 border-dashed px-5 py-8 text-center font-bold">
            {member ? labels.pending : labels.loginRequired}
          </p>
        )}
      </Popup>
    </>
  );
}
