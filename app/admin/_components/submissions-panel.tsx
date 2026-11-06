import { Download, MessageSquareReply } from "lucide-react";

import { getAllSubmissions } from "@/lib/submissions";
import { formatBytes } from "@/lib/submission-rules";
import { Button } from "@/components/ui/button";
import { replySubmission } from "../actions";

/* 관리자 페이지 'To teacher!' 탭 — 회원(학생)들이 To teacher! 로 보낸 글
   - 홈페이지·다른 학생은 볼 수 없음 (보낸 학생 본인은 마이페이지에서 자기 글과 답글만)
   - 글마다 내용, 파일 내려받기(1시간짜리 임시 주소), 선생님 답글 쓰기·고치기 */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });

export async function SubmissionsPanel() {
  const { items, error } = await getAllSubmissions();

  if (error) {
    return (
      <p className="mt-8 rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
        To teacher! 글을 불러오지 못했습니다: {error}
        <br />
        supabase/schema.sql 을 Supabase SQL Editor 에서 다시 실행했는지 확인하세요.
      </p>
    );
  }

  const unanswered = items.filter((s) => !s.reply).length;

  return (
    <section className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">
          To teacher! <span className="text-muted-foreground">({items.length})</span>
        </h2>
        {unanswered > 0 ? (
          <span className="rounded-full border-2 bg-yellow px-3 py-0.5 text-xs font-bold">답글 안 쓴 글 {unanswered}</span>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">
        학생들이 To teacher! 로 보낸 글이에요. 답글을 저장하면 보낸 학생이 마이페이지에서 읽을 수 있어요.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 받은 글이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.id} className="rounded-xl border">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.author ? `${s.author.name} (${s.author.student_no})` : "알 수 없음"} · {formatDate(s.created_at)}
                      {s.files.length > 0 ? ` · 파일 ${s.files.length}개` : ""}
                    </span>
                  </span>
                  <span
                    className={`rounded-full border-2 px-2 py-0.5 text-xs font-bold ${s.reply ? "bg-teal" : "bg-yellow"}`}
                  >
                    {s.reply ? "답글 완료" : "새 글"}
                  </span>
                </summary>

                <div className="space-y-5 border-t px-4 py-4">
                  {s.content ? (
                    <p className="whitespace-pre-line text-sm leading-relaxed">{s.content}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">(내용 없음)</p>
                  )}

                  {s.files.length > 0 ? (
                    <ul className="divide-y rounded-lg border text-sm">
                      {s.files.map((f) => (
                        <li key={f.path} className="flex items-center gap-3 px-3 py-2">
                          <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                          {f.url ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={f.url} download={f.name}>
                                <Download aria-hidden />
                                내려받기
                              </a>
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <form action={replySubmission} className="grid gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-bold">
                        선생님 답글
                        {s.replied_at ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {formatDate(s.replied_at)} 저장
                          </span>
                        ) : null}
                      </span>
                      <textarea
                        name="reply"
                        rows={3}
                        maxLength={3000}
                        defaultValue={s.reply ?? ""}
                        placeholder="학생에게 남길 답글 — 학생이 마이페이지에서 읽어요 (비우고 저장하면 답글이 지워져요)"
                        className="w-full rounded-lg border-2 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                      />
                    </label>
                    <Button type="submit" size="sm" className="justify-self-start">
                      <MessageSquareReply aria-hidden />
                      답글 저장
                    </Button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
