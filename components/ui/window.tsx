import { cn } from "@/lib/utils";

/* 네오브루탈리즘 '카드' 틀. 2px 검정 선 + 단단한 그림자 + 둥근 모서리.
   - title 을 주면 위쪽에 "동그란 아이콘 + 이름" 머리줄이 생깁니다.
   - 카드 색은 className 으로 바꿉니다. 예) <Window title="About" className="bg-yellow">
     (bg-card 흰색 · bg-orange · bg-yellow · bg-teal · bg-secondary 파랑)
   색·그림자는 app/globals.css 의 토큰을 따릅니다. */

/** 동그란 아이콘 (이름의 첫 글자) */
export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-yellow text-sm font-extrabold text-foreground",
        className
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function Window({
  title,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-2 bg-card text-card-foreground shadow-hard",
        className
      )}
    >
      {title ? (
        <div className="flex items-center gap-3 px-5 pt-5 sm:px-6">
          <Avatar name={title} />
          <p className="truncate text-sm font-bold">{title}</p>
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
