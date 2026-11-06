import { siteConfig } from "@/site.config";
import { getCurrentMember } from "@/lib/member-auth";
import { getNotices, getNoticeWriter } from "@/lib/notices";
import { Container } from "@/components/layout/container";
import { StandalonePage } from "@/components/layout/standalone-page";
import { Window } from "@/components/ui/window";
import { BoardList } from "@/components/sections/board-list";
import { BoardWrite } from "@/components/sections/board-write";
import { createNotice, prepareNoticeUpload } from "./actions";

/* 공지사항 페이지 (주소: /notice)
   - 날짜별로 묶어서 최신순. 제목을 누르면 내용과 첨부 파일이 펼쳐짐
   - 오른쪽 위 글쓰기: 관리자와 '공지 권한'을 받은 회원만 보임
   - 글자: site.config.ts 의 notice */

export const metadata = { title: `${siteConfig.notice.title} | ${siteConfig.name}` };
export const dynamic = "force-dynamic";

export default async function NoticePage() {
  const t = siteConfig.notice;
  const [member, notices] = await Promise.all([getCurrentMember(), getNotices()]);
  const writer = await getNoticeWriter(member);

  return (
    <StandalonePage title={t.title}>
      <section className="pb-16 sm:pb-24">
        <Container className="max-w-4xl">
          <Window title={t.eyebrow} bodyClassName="p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
              </div>
              {writer.allowed ? (
                <BoardWrite
                  prepareUpload={prepareNoticeUpload}
                  submit={createNotice}
                  labels={{
                    writeLabel: t.writeLabel,
                    writeTitle: t.writeTitle,
                    submitLabel: t.submitLabel,
                    closeLabel: t.closeLabel,
                    fileHint: t.fileHint,
                    titlePlaceholder: "예: 11월 현장체험학습 안내",
                    contentPlaceholder: "공지할 내용을 적어 주세요.",
                    againLabel: "공지사항 하나 더 쓰기",
                  }}
                />
              ) : null}
            </div>

            <BoardList items={notices} emptyText={t.emptyText} attachmentsLabel={t.attachmentsLabel} />
          </Window>
        </Container>
      </section>
    </StandalonePage>
  );
}
