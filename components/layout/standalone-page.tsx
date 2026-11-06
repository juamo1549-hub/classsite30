import { getCurrentMember } from "@/lib/member-auth";
import { getSiteMenu } from "@/lib/site-menu";
import { SiteShell } from "@/components/layout/site-shell";
import { Footer } from "@/components/layout/footer";

/* 섹션 하나만 크게 보여 주는 따로 페이지의 틀 (예: /schedule, /recent, /to-teacher, /gallery)
   - 첫 화면과 똑같은 상단 메뉴 + 왼쪽 사이드바(아이콘에 마우스를 올리면 화면을 밀고 열림)
   - 상단 메뉴 맨 왼쪽에 뒤로 가기 버튼, 로고(Class Studio)를 누르면 첫 화면 */
export async function StandalonePage({
  children,
  mainClassName = "pt-8 sm:pt-12",
}: {
  /** 페이지 이름 (브라우저 탭 제목은 각 페이지의 metadata 에서) */
  title?: string;
  children: React.ReactNode;
  mainClassName?: string;
}) {
  const [member, menu] = await Promise.all([getCurrentMember(), getSiteMenu()]);

  return (
    <SiteShell menu={menu} member={member} showBack>
      <main className={`flex-1 ${mainClassName}`}>{children}</main>
      <Footer />
    </SiteShell>
  );
}
