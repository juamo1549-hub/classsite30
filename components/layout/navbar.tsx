"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/window";
import { MemberMenu } from "@/components/layout/member-menu";
import type { SessionMember } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 사이드바 열기/닫기에 필요한 값 (components/layout/site-shell.tsx 에서 넘겨줌) */
type SidebarControl = {
  open: boolean;
  pinned: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
};

/** "#recent" → "/#recent" (첫 화면이 아닌 페이지에서도 첫 화면의 그 위치로 가도록) */
const homeAnchor = (href: string) => (href.startsWith("#") ? `/${href}` : href);

/** 상단 메뉴. 메뉴 항목은 site.config.ts 의 nav 에서 바꿉니다. 모바일에서는 햄버거 버튼으로 열림.
    sidebar 를 넘기면 로고 왼쪽에 사이드바 아이콘이 생깁니다. (마우스 올리면 열림, 클릭하면 고정/닫기)
    오른쪽 끝에는 로그인·회원가입 버튼 (로그인하면 이름·로그아웃)
    showBack 을 켜면 맨 왼쪽에 뒤로 가기 버튼 (첫 화면이 아닌 페이지에서) */
export function Navbar({
  sidebar,
  member = null,
  showBack = false,
}: {
  sidebar?: SidebarControl;
  member?: SessionMember | null;
  showBack?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 뒤로 가기: 이 사이트 안에서 왔으면 이전 화면으로, 아니면(주소로 바로 들어왔으면) 첫 화면으로
  const goBack = () => {
    const cameFromHere = document.referrer.startsWith(window.location.origin);
    if (cameFromHere && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 bg-card">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {showBack ? (
            <button
              type="button"
              aria-label="뒤로 가기"
              title="뒤로 가기"
              onClick={goBack}
              className="inline-flex size-10 items-center justify-center rounded-full border-2 bg-card shadow-hard-sm transition-all hover:bg-yellow active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : null}
          {sidebar ? (
            <button
              type="button"
              aria-label={sidebar.open ? "전체 메뉴 닫기" : "전체 메뉴 열기"}
              aria-expanded={sidebar.open}
              aria-controls="site-sidebar"
              title={
                sidebar.pinned
                  ? "클릭하면 닫혀요"
                  : "클릭하면 열린 채로 고정돼요"
              }
              onMouseEnter={sidebar.onEnter}
              onMouseLeave={sidebar.onLeave}
              onClick={sidebar.onToggle}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border-2 shadow-hard-sm transition-colors",
                sidebar.open ? "bg-yellow" : "bg-card hover:bg-yellow",
              )}
            >
              {sidebar.open ? (
                <PanelLeftClose className="size-5" />
              ) : (
                <PanelLeftOpen className="size-5" />
              )}
            </button>
          ) : null}
          <Link
            href="/"
            aria-label={`${siteConfig.name} 첫 화면`}
            className="flex items-center gap-3 text-lg font-extrabold"
          >
            <Avatar name={siteConfig.name} className="bg-orange" />
            {/* 뒤로 가기 버튼이 있는 좁은 화면(휴대폰)에서는 자리가 모자라 로고 동그라미만 */}
            <span className={cn("whitespace-nowrap", showBack && "hidden sm:inline")}>
              {siteConfig.name}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
          {/* 데스크톱 메뉴 */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={homeAnchor(item.href)}
                className="text-sm font-bold transition-colors hover:text-secondary"
              >
                {item.label}
              </a>
            ))}
            <Button asChild size="sm" variant="accent">
              <a
                href={siteConfig.secretButton.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteConfig.secretButton.label}
              </a>
            </Button>
          </nav>

          {/* 로그인 · 회원가입 (모든 화면 크기에서 보임) */}
          <MemberMenu member={member} />

          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border-2 bg-card shadow-hard-sm md:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {/* 모바일 메뉴 펼침 */}
      <nav
        className={cn(
          "border-t-2 bg-card md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <Container className="flex flex-col py-2">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={homeAnchor(item.href)}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-bold hover:text-secondary"
            >
              {item.label}
            </a>
          ))}
          <a
            href={siteConfig.secretButton.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="py-3 text-base font-bold hover:text-secondary"
          >
            {siteConfig.secretButton.label}
          </a>
        </Container>
      </nav>
    </header>
  );
}
