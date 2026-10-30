"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/window";
import { cn } from "@/lib/utils";

/** 사이드바 열기/닫기에 필요한 값 (components/layout/site-shell.tsx 에서 넘겨줌) */
type SidebarControl = {
  open: boolean;
  pinned: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
};

/** 상단 메뉴. 메뉴 항목은 site.config.ts 의 nav 에서 바꿉니다. 모바일에서는 햄버거 버튼으로 열림.
    sidebar 를 넘기면 로고 왼쪽에 사이드바 아이콘이 생깁니다. (마우스 올리면 열림, 클릭하면 고정/닫기) */
export function Navbar({ sidebar }: { sidebar?: SidebarControl }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 bg-card">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {sidebar ? (
            <button
              type="button"
              aria-label={sidebar.open ? "전체 메뉴 닫기" : "전체 메뉴 열기"}
              aria-expanded={sidebar.open}
              aria-controls="site-sidebar"
              title={sidebar.pinned ? "클릭하면 닫혀요" : "클릭하면 열린 채로 고정돼요"}
              onMouseEnter={sidebar.onEnter}
              onMouseLeave={sidebar.onLeave}
              onClick={sidebar.onToggle}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border-2 shadow-hard-sm transition-colors",
                sidebar.open ? "bg-yellow" : "bg-card hover:bg-yellow"
              )}
            >
              {sidebar.open ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
            </button>
          ) : null}
          <Link href="/" className="flex items-center gap-3 text-lg font-extrabold">
            <Avatar name={siteConfig.name} className="bg-orange" />
            {siteConfig.name}
          </Link>
        </div>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-bold transition-colors hover:text-secondary"
            >
              {item.label}
            </a>
          ))}
          <Button asChild size="sm" variant="accent">
            <a href={siteConfig.secretButton.href} target="_blank" rel="noopener noreferrer">
              {siteConfig.secretButton.label}
            </a>
          </Button>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border-2 bg-card shadow-hard-sm md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {/* 모바일 메뉴 펼침 */}
      <nav className={cn("border-t-2 bg-card md:hidden", open ? "block" : "hidden")}>
        <Container className="flex flex-col py-2">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
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
