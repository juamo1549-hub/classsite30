import { siteConfig } from "@/site.config";
import { getEvents } from "@/lib/schedule";
import { seoulDateKey } from "@/lib/seoul-time";
import { Container } from "@/components/layout/container";
import { Window } from "@/components/ui/window";
import { ScheduleCalendar } from "@/components/sections/schedule-calendar";

/* 학급 일정 섹션 (히어로 바로 아래, 최근 새 글 위).
   - 글자: site.config.ts 의 schedule
   - canEdit: 관리자이거나 '일정 권한'을 받은 회원이면 true (app/page.tsx 에서 확인해서 넘겨줌) */
export async function Schedule({ canEdit }: { canEdit: boolean }) {
  const { schedule } = siteConfig;
  const events = await getEvents();

  return (
    <section id="schedule" className="scroll-mt-16 pb-16 sm:pb-24">
      <Container>
        <Window title={schedule.eyebrow} bodyClassName="p-5 sm:p-8">
          <h2 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">{schedule.title}</h2>
          <ScheduleCalendar events={events} todayKey={seoulDateKey(new Date())} canEdit={canEdit} />
        </Window>
      </Container>
    </section>
  );
}
