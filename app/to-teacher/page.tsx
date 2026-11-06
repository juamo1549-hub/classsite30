import { siteConfig } from "@/site.config";
import { getCurrentMember } from "@/lib/member-auth";
import { StandalonePage } from "@/components/layout/standalone-page";
import { ToTeacher } from "@/components/sections/to-teacher";

/* To teacher! 만 크게 보는 페이지 (주소: /to-teacher) — 왼쪽 사이드바에서 새 창으로 열림 */

export const metadata = { title: `${siteConfig.toTeacher.eyebrow} | ${siteConfig.name}` };
export const dynamic = "force-dynamic";

export default async function ToTeacherPage() {
  const member = await getCurrentMember();
  return (
    <StandalonePage title={siteConfig.toTeacher.eyebrow}>
      <ToTeacher member={member} />
    </StandalonePage>
  );
}
