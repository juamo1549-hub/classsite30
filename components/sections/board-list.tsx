import { Download, Paperclip } from "lucide-react";

import { seoulDateKey } from "@/lib/seoul-time";
import { formatBytes } from "@/lib/submission-rules";
import type { Attachment, Item } from "@/lib/types";

/* 게시판 글 목록 (공용) — 공지사항, 자료실
   - 날짜(한국 시간)별로 묶어서 최신순
   - 제목을 누르면 내용과 첨부 파일(내려받기)이 펼쳐짐 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-11-06" → "2026년 11월 6일 (금)" */
function dateHeading(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}년 ${m}월 ${d}일 (${weekday})`;
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Seoul" });

export function BoardList({
  items,
  emptyText,
  attachmentsLabel,
}: {
  items: Item[];
  emptyText: string;
  attachmentsLabel: string;
}) {
  // 날짜별로 묶기 — 이미 최신순이라 순서 그대로
  const groups: { key: string; items: Item[] }[] = [];
  for (const n of items) {
    const key = seoulDateKey(n.created_at);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(n);
    else groups.push({ key, items: [n] });
  }

  if (groups.length === 0) {
    return (
      <p className="mt-8 rounded-xl border-2 border-dashed px-5 py-12 text-center font-medium text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {groups.map((g) => (
        <section key={g.key} aria-label={dateHeading(g.key)}>
          <h2 className="mb-3 inline-block rounded-full border-2 bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
            {dateHeading(g.key)}
          </h2>
          <ul className="space-y-3">
            {g.items.map((n) => {
              const files = (n.attachments ?? []) as Attachment[];
              return (
                <li key={n.id} className="overflow-hidden rounded-xl border-2 bg-card">
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 hover:bg-yellow/20">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-extrabold">{n.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {n.author ?? "관리자"} · {timeOf(n.created_at)}
                        </span>
                      </span>
                      {files.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-xs font-bold">
                          <Paperclip className="size-3.5" aria-hidden />
                          {files.length}
                        </span>
                      ) : null}
                    </summary>
                    <div className="space-y-4 border-t-2 px-4 py-4">
                      {n.description ? (
                        <p className="whitespace-pre-line text-sm leading-relaxed">{n.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">(내용 없음)</p>
                      )}
                      {files.length > 0 ? (
                        <div>
                          <p className="mb-2 text-xs font-bold text-muted-foreground">{attachmentsLabel}</p>
                          <ul className="divide-y-2 rounded-lg border-2 text-sm">
                            {files.map((f) => (
                              <li key={f.path} className="flex items-center gap-3 px-3 py-2">
                                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                                <a
                                  href={`${f.url}?download=${encodeURIComponent(f.name)}`}
                                  download={f.name}
                                  aria-label={`${f.name} 내려받기`}
                                  className="inline-flex size-8 items-center justify-center rounded-full border-2 hover:bg-yellow"
                                >
                                  <Download className="size-4" aria-hidden />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
