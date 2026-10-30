import { siteConfig } from "@/site.config";
import { getHeroText } from "@/lib/data";
import { SiteShell, type SidebarGroup, type SidebarIcon } from "@/components/layout/site-shell";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Features } from "@/components/sections/features";
import { Contact } from "@/components/sections/contact";

/* 메인 페이지 = 섹션 블록을 위에서 아래로 쌓아 놓은 것.
   - 섹션 순서 바꾸기: 아래 줄의 순서를 바꾸면 됩니다.
   - 섹션 빼기: 해당 줄을 지우면 됩니다.
   - 새 섹션 추가: components/sections 에 파일을 만들고 여기에 한 줄 추가.
   - 상단 메뉴 + 왼쪽 사이드바(전체 메뉴)는 SiteShell 이 담당합니다. */

// 관리자 페이지에서 내용을 바꾸면 최대 60초 안에 반영 (저장 즉시 반영도 되어 있음)
export const revalidate = 60;

/** 상단 메뉴 주소(#about 등) → 사이드바 아이콘 */
const SECTION_ICONS: Record<string, SidebarIcon> = {
  "#about": "info",
  "#features": "sparkles",
  "#contact": "mail",
};

export default async function HomePage() {
  const { hero, nav, secretButton, sidebar } = siteConfig;
  const text = await getHeroText(); // 버튼 이름은 관리자에서 바꾼 글자를 그대로 사용

  const menu: SidebarGroup[] = [
    {
      title: sidebar.sectionsTitle,
      items: nav.map((item) => ({ ...item, icon: SECTION_ICONS[item.href] ?? "info" })),
    },
    {
      title: sidebar.classTitle,
      items: [
        { label: text.primaryLabel, href: hero.primaryCta.href, icon: "megaphone" },
        { label: text.secondaryLabel, href: hero.secondaryCta.href, icon: "folder" },
        { label: text.thirdLabel, href: hero.thirdCta.href, icon: "book" },
        { label: text.fourthLabel, href: hero.fourthCta.href, icon: "messages" },
      ],
    },
    {
      title: sidebar.adminTitle,
      items: [{ label: secretButton.label, href: secretButton.href, icon: "lock", newTab: true }],
    },
  ];

  return (
    <SiteShell menu={menu}>
      <main className="flex-1">
        <Hero />
        <About />
        <Features />
        <Contact />
      </main>
      <Footer />
    </SiteShell>
  );
}
