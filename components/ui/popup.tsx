"use client";

import { X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* 가운데 뜨는 창 (글쓰기, 리스트, 로그인, 회원가입 등 공용).
   - 여는 법: dialogRef.current?.showModal()
   - 닫기: 오른쪽 위 X 버튼, 창 바깥 클릭, Esc 키
   - fullScreen: 화면 전체를 덮는 창 (바깥이 없어서 실수로 닫히지 않음. 예: 회원가입) */
export function Popup({
  dialogRef,
  title,
  closeLabel,
  Icon,
  className,
  fullScreen,
  onClose,
  children,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  title: string;
  closeLabel: string;
  Icon: LucideIcon;
  /** 창 너비 등 (기본: 최대 40rem) */
  className?: string;
  /** 화면 전체로 열기 (내용은 가운데 정렬) */
  fullScreen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (!fullScreen && e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className={cn(
        "overflow-y-auto bg-card p-0 text-foreground backdrop:bg-foreground/50 backdrop:backdrop-blur-sm",
        fullScreen
          ? "m-0 h-dvh max-h-none w-screen max-w-none"
          : "m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100%-2rem))] rounded-xl border-2 shadow-hard",
        className
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 bg-card px-5 py-4",
          fullScreen && "sm:px-8"
        )}
      >
        <p className="flex items-center gap-3 text-lg font-extrabold">
          <span className="inline-flex size-9 items-center justify-center rounded-full border-2 bg-yellow">
            <Icon className="size-5" aria-hidden />
          </span>
          {title}
        </p>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={closeLabel}
          className="inline-flex size-10 items-center justify-center rounded-full border-2 bg-card shadow-hard-sm transition-all hover:bg-yellow active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className={cn("p-5", fullScreen && "mx-auto w-full max-w-2xl py-8")}>{children}</div>
    </dialog>
  );
}
