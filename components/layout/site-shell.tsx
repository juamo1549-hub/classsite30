"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Armchair,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Puzzle,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Lock,
  Mail,
  Megaphone,
  MessagesSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import type { SessionMember } from "@/lib/types";
import { cn } from "@/lib/utils";

/* 사이트 전체 틀 = 상단 메뉴 + 왼쪽 사이드바 + 본문.
   - 상단 메뉴의 사이드바 아이콘에 마우스를 올리면 사이드바가 열리고, 본문(히어로 등)이 오른쪽으로 밀려남
   - 마우스가 아이콘·사이드바 밖으로 나가면 잠시 뒤 닫힘
   - 아이콘을 클릭하면 '고정'(마우스를 떼도 열린 채) ↔ 닫기
   - 휴대폰(좁은 화면)에서는 본문을 밀지 않고 위에 덮어서 열림
   - 사이드바 메뉴를 누르면 새 창 없이 지금 창에서 그 페이지(/schedule 등)로 바로 바뀜
     (관리자 페이지처럼 newTab 이 켜진 메뉴만 새 탭)
   - 하위 메뉴가 있는 메뉴(공부방)는 마우스를 올리면 아래로 펼쳐짐
   - 메뉴 목록은 lib/site-menu.ts 에서 만들어 넘겨줍니다. */

/** 사이드바 메뉴 아이콘 이름 → 아이콘 */
const ICONS = {
  info: Info,
  sparkles: Sparkles,
  mail: Mail,
  megaphone: Megaphone,
  folder: FolderOpen,
  image: ImageIcon,
  book: BookOpen,
  calendar: CalendarDays,
  messages: MessagesSquare,
  lock: Lock,
  question: CircleHelp,
  quiz: Puzzle,
  assignment: ClipboardList,
  seat: Armchair,
} satisfies Record<string, LucideIcon>;

export type SidebarIcon = keyof typeof ICONS;
export type SidebarLink = { label: string; href: string; icon: SidebarIcon; newTab?: boolean };
export type SidebarGroup = {
  title: string;
  /** children 이 있으면: 마우스를 올리면(휴대폰은 ▾ 버튼) 아래로 하위 메뉴가 펼쳐짐 (예: 공부방) */
  items: (SidebarLink & { children?: SidebarLink[] })[];
};

const linkClass =
  "flex min-w-0 flex-1 items-center gap-3 rounded-full border-2 border-transparent px-3 py-2 text-sm font-bold transition-all hover:border-border hover:bg-yellow hover:shadow-hard-sm";

/** 사이드바 메뉴 한 줄. 하위 메뉴가 있으면 마우스를 올렸을 때 아래로 펼쳐짐 */
function SidebarItem({ item, onPick }: { item: SidebarGroup["items"][number]; onPick: () => void }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[item.icon];
  const newTab = item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  if (!item.children?.length) {
    return (
      <li>
        <Link href={item.href} {...newTab} onClick={onPick} className={linkClass}>
          <Icon className="size-4 shrink-0" aria-hidden />
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="group/sub" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex items-center gap-1">
        <Link href={item.href} {...newTab} onClick={onPick} className={linkClass}>
          <Icon className="size-4 shrink-0" aria-hidden />
          {item.label}
        </Link>
        {/* 휴대폰처럼 마우스가 없을 때 하위 메뉴 열기·닫기 */}
        <button
          type="button"
          aria-label={`${item.label} 하위 메뉴 ${open ? "닫기" : "열기"}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-transparent hover:border-border hover:bg-yellow"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </div>
      {/* 하위 메뉴: 펼쳐지면 아래 메뉴들이 밀려 내려감 */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out group-focus-within/sub:grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <ul className="ml-5 space-y-1 overflow-hidden border-l-2 pl-2">
          {item.children.map((child) => {
            const ChildIcon = ICONS[child.icon];
            return (
              <li key={child.href} className="first:mt-1">
                <Link href={child.href} onClick={onPick} className={cn(linkClass, "py-1.5 text-[0.8rem]")}>
                  <ChildIcon className="size-3.5 shrink-0" aria-hidden />
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}

const CLOSE_DELAY_MS = 250;

export function SiteShell({
  menu,
  member = null,
  showBack = false,
  children,
}: {
  menu: SidebarGroup[];
  /** 상단 메뉴 맨 왼쪽에 뒤로 가기 버튼 (첫 화면이 아닌 페이지에서 켬) */
  showBack?: boolean;
  /** 로그인한 회원 (상단 메뉴의 로그인·회원가입 자리에 이름 표시) */
  member?: SessionMember | null;
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
      <Navbar sidebar={sidebar} member={member} showBack={showBack} />

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
                {group.items.map((item) => (
                  // 메뉴를 고르면 사이드바를 닫고, 지금 창에서 그 페이지로 바로 바뀜
                  <SidebarItem key={`${item.href}-${item.label}`} item={item} onPick={close} />
                ))}
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
