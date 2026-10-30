"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  FolderOpen,
  Info,
  Lock,
  Mail,
  Megaphone,
  MessagesSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

/* 사이트 전체 틀 = 상단 메뉴 + 왼쪽 사이드바 + 본문.
   - 상단 메뉴의 사이드바 아이콘에 마우스를 올리면 사이드바가 열리고, 본문(히어로 등)이 오른쪽으로 밀려남
   - 마우스가 아이콘·사이드바 밖으로 나가면 잠시 뒤 닫힘
   - 아이콘을 클릭하면 '고정'(마우스를 떼도 열린 채) ↔ 닫기
   - 휴대폰(좁은 화면)에서는 본문을 밀지 않고 위에 덮어서 열림
   - 메뉴 목록은 app/page.tsx 에서 만들어 넘겨줍니다. */

/** 사이드바 메뉴 아이콘 이름 → 아이콘 */
const ICONS = {
  info: Info,
  sparkles: Sparkles,
  mail: Mail,
  megaphone: Megaphone,
  folder: FolderOpen,
  book: BookOpen,
  messages: MessagesSquare,
  lock: Lock,
} satisfies Record<string, LucideIcon>;

export type SidebarIcon = keyof typeof ICONS;
export type SidebarGroup = {
  title: string;
  items: { label: string; href: string; icon: SidebarIcon; newTab?: boolean }[];
};

const CLOSE_DELAY_MS = 250;

export function SiteShell({
  menu,
  children,
}: {
  menu: SidebarGroup[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const close = () => {
    cancelClose();
    setOpen(false);
    setPinned(false);
  };

  const sidebar = {
    open,
    pinned,
    // 마우스를 올리면 열기
    onEnter: () => {
      cancelClose();
      setOpen(true);
    },
    // 마우스가 나가면 (고정이 아닐 때) 잠시 뒤 닫기
    onLeave: () => {
      if (pinned) return;
      cancelClose();
      closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
    },
    // 클릭: 열려 있고 고정이면 닫기, 아니면 열고 고정
    onToggle: () => {
      if (open && pinned) close();
      else {
        cancelClose();
        setOpen(true);
        setPinned(true);
      }
    },
  };

  // Esc 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => cancelClose, []);

  return (
    <>
      <Navbar sidebar={sidebar} />

      {/* 휴대폰: 바깥을 누르면 닫히는 반투명 배경 */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 top-16 z-30 bg-foreground/30 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        id="site-sidebar"
        aria-label="전체 메뉴"
        aria-hidden={!open}
        inert={!open}
        onMouseEnter={sidebar.onEnter}
        onMouseLeave={sidebar.onLeave}
        className={cn(
          "fixed bottom-0 left-0 top-16 z-40 w-64 overflow-y-auto border-r-2 bg-card p-5 transition-transform duration-300 ease-out",
          open ? "translate-x-0 shadow-hard" : "-translate-x-full"
        )}
      >
        <nav className="space-y-6">
          {menu.map((group) => (
            <div key={group.title}>
              <p className="mb-2 inline-block rounded-full border-2 bg-secondary px-3 py-0.5 text-xs font-bold uppercase tracking-[0.15em] text-secondary-foreground">
                {group.title}
              </p>
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon];
                  return (
                    <li key={`${item.href}-${item.label}`}>
                      <a
                        href={item.href}
                        {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={() => {
                          // 휴대폰에서는 메뉴를 고르면 닫기
                          if (window.matchMedia("(max-width: 767px)").matches) close();
                        }}
                        className="flex items-center gap-3 rounded-full border-2 border-transparent px-3 py-2 text-sm font-bold transition-all hover:border-border hover:bg-yellow hover:shadow-hard-sm"
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* 본문: 사이드바가 열리면 (넓은 화면에서) 사이드바 폭만큼 오른쪽으로 밀림 */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin] duration-300 ease-out",
          open && "md:ml-64"
        )}
      >
        {children}
      </div>
    </>
  );
}
