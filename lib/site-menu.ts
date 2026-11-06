import "server-only";

import { siteConfig } from "@/site.config";
import { getHeroText } from "@/lib/data";
import type { SidebarGroup, SidebarIcon } from "@/components/layout/site-shell";

/* 왼쪽 사이드바(전체 메뉴) 목록 — 첫 화면과 따로 페이지(/schedule 등)에서 똑같이 씀 */

/** 상단 메뉴 주소(#recent 등) → 사이드바 아이콘 */
const SECTION_ICONS: Record<string, SidebarIcon> = {
  "#schedule": "calendar",
  "#recent": "sparkles",
  "#gallery": "image",
  "#to-teacher": "mail",
};

/** 첫 화면 안의 위치(#schedule 등) → 그 부분만 크게 보는 따로 페이지 */
const SECTION_PAGES: Record<string, string> = {
  "#schedule": "/schedule",
  "#recent": "/recent",
  "#gallery": "/gallery",
  "#to-teacher": "/to-teacher",
};
const toPage = (href: string) => SECTION_PAGES[href] ?? href;

export async function getSiteMenu(): Promise<SidebarGroup[]> {
  const { hero, nav, secretButton, sidebar, studyRooms, seating } = siteConfig;
  const text = await getHeroText(); // 버튼 이름은 관리자에서 바꾼 글자를 그대로 사용

  return [
    {
      title: sidebar.sectionsTitle,
      items: nav.map((item) => ({ ...item, href: toPage(item.href), icon: SECTION_ICONS[item.href] ?? "info" })),
    },
    {
      title: sidebar.classTitle,
      items: [
        { label: text.primaryLabel, href: toPage(hero.primaryCta.href), icon: "megaphone" },
        { label: text.secondaryLabel, href: toPage(hero.secondaryCta.href), icon: "folder" },
        {
          label: text.thirdLabel,
          href: toPage(hero.thirdCta.href),
          icon: "book",
          // 공부방 하위 메뉴 (마우스를 올리면 펼쳐짐)
          children: studyRooms.rooms.map((room) => ({
            label: room.label,
            href: `/study/${room.key}`,
            icon: room.icon as SidebarIcon,
          })),
        },
        { label: text.fourthLabel, href: toPage(hero.fourthCta.href), icon: "messages" },
        { label: seating.label, href: "/seating", icon: "seat" },
      ],
    },
    {
      title: sidebar.adminTitle,
      items: [{ label: secretButton.label, href: secretButton.href, icon: "lock", newTab: true }],
    },
  ];
}
