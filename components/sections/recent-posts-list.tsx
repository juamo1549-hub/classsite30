"use client";

import { useState } from "react";
import { ArrowUpRight, BookOpen, Megaphone, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* 최근 새 글 목록 + 위쪽 분류 버튼(전체 / 공지사항 / 공부방).
   분류 버튼을 누르면 그 분류의 글만 보여줍니다. (components/sections/recent-posts.tsx 에서 사용) */

export type RecentPost = {
  id: string;
  section: string;
  title: string;
  description: string | null;
  link: string | null;
  date: string;
};

/** 분류별 아이콘과 꼬리표 색 (색은 app/globals.css 토큰) */
const SECTION_STYLE: Record<string, { Icon: LucideIcon; badge: string }> = {
  notice: { Icon: Megaphone, badge: "bg-orange" },
  study: { Icon: BookOpen, badge: "bg-teal" },
};
const FALLBACK_STYLE = { Icon: Megaphone, badge: "bg-yellow" };

export function RecentPostsList({
  title,
  allLabel,
  emptyText,
  sections,
  posts,
}: {
  title: string;
  allLabel: string;
  emptyText: string;
  sections: { key: string; label: string }[];
  posts: RecentPost[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const labelOf = (key: string) => sections.find((s) => s.key === key)?.label ?? key;
  const shown = filter === "all" ? posts : posts.filter((p) => p.section === filter);

  const tabs = [{ key: "all", label: allLabel }, ...sections];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        <div role="group" aria-label="글 분류" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const count =
              tab.key === "all" ? posts.length : posts.filter((p) => p.section === tab.key).length;
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "rounded-full border-2 px-4 py-1.5 text-sm font-bold shadow-hard-sm transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                  active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-yellow"
                )}
              >
                {tab.label} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-xl border-2 border-dashed px-5 py-10 text-center font-medium text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map((post) => {
            const { Icon, badge } = SECTION_STYLE[post.section] ?? FALLBACK_STYLE;
            const body = (
              <>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border-2 px-3 py-1 text-xs font-bold",
                    badge
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {labelOf(post.section)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-extrabold">
                    <span className="truncate">{post.title}</span>
                    {post.link ? <ArrowUpRight className="size-4 shrink-0" aria-hidden /> : null}
                  </p>
                  {post.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                  ) : null}
                </div>
                <time className="shrink-0 text-sm font-bold text-muted-foreground">{post.date}</time>
              </>
            );
            const rowClass =
              "flex flex-col gap-2 rounded-xl border-2 bg-card p-4 sm:flex-row sm:items-center sm:gap-4";

            return (
              <li key={post.id}>
                {post.link ? (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      rowClass,
                      "transition-all hover:-translate-y-0.5 hover:bg-yellow/30 hover:shadow-hard-sm"
                    )}
                  >
                    {body}
                  </a>
                ) : (
                  <div className={rowClass}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
