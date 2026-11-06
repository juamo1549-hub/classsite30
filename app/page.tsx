import { getCurrentMember } from "@/lib/member-auth";
import { getScheduleEditor } from "@/lib/schedule";
import { getSiteMenu } from "@/lib/site-menu";
import { SiteShell } from "@/components/layout/site-shell";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Schedule } from "@/components/sections/schedule";
import { RecentPosts } from "@/components/sections/recent-posts";
import { Features } from "@/components/sections/features";
import { ToTeacher } from "@/components/sections/to-teacher";

/* 메인 페이지 = 섹션 블록을 위에서 아래로 쌓아 놓은 것.
   - 섹션 순서 바꾸기: 아래 줄의 순서를 바꾸면 됩니다.
   - 섹션 빼기: 해당 줄을 지우면 됩니다.
   - 새 섹션 추가: components/sections 에 파일을 만들고 여기에 한 줄 추가.
   - 상단 메뉴 + 왼쪽 사이드바(전체 메뉴)는 SiteShell 이 담당합니다. (메뉴 목록: lib/site-menu.ts)
   - 연락처(Contact) 자리는 To teacher! 로 바꿨습니다. (components/sections/contact.tsx 파일은 그대로 있음)
   - 소개(About) 섹션은 지금 빼 두었습니다. 다시 넣으려면 components/sections/about 을 불러와 <About /> 한 줄 추가. */

// 로그인한 사람마다 상단 메뉴가 달라서, 방문할 때마다 새로 그림 (관리자에서 바꾼 내용도 바로 보임)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const member = await getCurrentMember(); // 로그인한 회원 (없으면 null)
  const scheduleEditor = await getScheduleEditor(member); // 일정을 쓸 수 있는 사람인지
  const menu = await getSiteMenu();

  return (
    <SiteShell menu={menu} member={member}>
      <main className="flex-1">
        <Hero />
        <Schedule canEdit={scheduleEditor.allowed} />
        <RecentPosts />
        <Features />
        <ToTeacher member={member} />
      </main>
      <Footer />
    </SiteShell>
  );
}
