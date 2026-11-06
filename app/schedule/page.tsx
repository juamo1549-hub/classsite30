import { siteConfig } from "@/site.config";
import { getCurrentMember } from "@/lib/member-auth";
import { getScheduleEditor } from "@/lib/schedule";
import { StandalonePage } from "@/components/layout/standalone-page";
import { Schedule } from "@/components/sections/schedule";

/* 학급 일정만 크게 보는 페이지 (주소: /schedule) — 왼쪽 사이드바에서 새 창으로 열림 */

export const metadata = { title: `${siteConfig.schedule.title} | ${siteConfig.name}` };
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const editor = await getScheduleEditor(await getCurrentMember());
  return (
    <StandalonePage title={siteConfig.schedule.title}>
      <Schedule canEdit={editor.allowed} />
    </StandalonePage>
  );
}
