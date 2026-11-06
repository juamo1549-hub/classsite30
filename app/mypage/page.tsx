import { Download, MessageSquareReply, Send } from "lucide-react";

import { siteConfig } from "@/site.config";
import { getCurrentMember } from "@/lib/member-auth";
import { getMySubmissions } from "@/lib/submissions";
import { formatBytes } from "@/lib/submission-rules";
import { Container } from "@/components/layout/container";
import { StandalonePage } from "@/components/layout/standalone-page";
import { Avatar, Window } from "@/components/ui/window";

/* 마이페이지 (주소: /mypage) — 로그인한 회원 본인만
   - To teacher! 로 선생님께 보낸 글 목록 (내 글만)
   - 선생님이 답글을 달았으면 그 아래에 '선생님 답글'로 보임
   - 글자: site.config.ts 의 myPage */

export const metadata = { title: `${siteConfig.myPage.title} | ${siteConfig.name}` };
export const dynamic = "force-dynamic";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });

export default async function MyPage() {
  const t = siteConfig.myPage;
  const member = await getCurrentMember();
  const items = member ? await getMySubmissions(member.id) : [];
  const replied = items.filter((s) => s.reply).length;

  return (
    <StandalonePage title={t.title}>
      <section className="pb-16 sm:pb-24">
        <Container className="max-w-3xl">
          {!member ? (
            <p className="rounded-xl border-2 border-dashed px-5 py-12 text-center font-bold">{t.loginRequiredText}</p>
          ) : (
            <Window title={t.title} bodyClassName="p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={member.name} className="size-12 bg-teal text-lg" />
                <div>
                  <h1 className="text-2xl font-extrabold">{member.name}님</h1>
                  <p className="text-sm text-muted-foreground">
                    {t.submissionsTitle} {items.length}개 · 답글 {replied}개
                  </p>
                </div>
              </div>

              <h2 className="mb-4 mt-8 flex items-center gap-2 text-lg font-extrabold">
                <Send className="size-5" aria-hidden />
                {t.submissionsTitle}
              </h2>

              {items.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed px-5 py-10 text-center font-medium text-muted-foreground">
                  {t.emptyText}
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.map((s) => (
                    <li key={s.id} className="overflow-hidden rounded-xl border-2">
                      <details open={Boolean(s.reply)}>
                        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted/50">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-extrabold">{s.title}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(s.created_at)} 보냄</span>
                          </span>
                          <span
                            className={`rounded-full border-2 px-2 py-0.5 text-xs font-bold ${s.reply ? "bg-teal" : "bg-muted"}`}
                          >
                            {s.reply ? t.newReplyBadge : "답글 기다리는 중"}
                          </span>
                        </summary>

                        <div className="space-y-4 border-t-2 px-4 py-4">
                          {s.content ? (
                            <p className="whitespace-pre-line text-sm leading-relaxed">{s.content}</p>
                          ) : null}
                          {s.files.length > 0 ? (
                            <ul className="divide-y-2 rounded-lg border-2 text-sm">
                              {s.files.map((f) => (
                                <li key={f.path} className="flex items-center gap-3 px-3 py-2">
                                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                                  <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                                  {f.url ? (
                                    <a
                                      href={f.url}
                                      download={f.name}
                                      aria-label={`${f.name} 내려받기`}
                                      className="inline-flex size-8 items-center justify-center rounded-full border-2 hover:bg-yellow"
                                    >
                                      <Download className="size-4" aria-hidden />
                                    </a>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {/* 선생님 답글 */}
                          <div className={`rounded-xl border-2 p-4 ${s.reply ? "bg-yellow/40" : "border-dashed"}`}>
                            <p className="mb-1 flex items-center gap-2 text-sm font-extrabold">
                              <MessageSquareReply className="size-4" aria-hidden />
                              {t.replyTitle}
                              {s.replied_at ? (
                                <span className="text-xs font-medium text-muted-foreground">{formatDate(s.replied_at)}</span>
                              ) : null}
                            </p>
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                              {s.reply ?? <span className="text-muted-foreground">{t.noReplyText}</span>}
                            </p>
                          </div>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </Window>
          )}
        </Container>
      </section>
    </StandalonePage>
  );
}
