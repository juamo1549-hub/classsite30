import { cn } from "@/lib/utils";

/** 섹션 위쪽의 작은 영문 라벨 + 제목 + 설명. 모든 섹션이 같은 모양을 쓰도록 한 곳에 모아 둠.
    라벨은 파란 알약 모양 띠로 보입니다. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="inline-block rounded-full border-2 bg-secondary px-3 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-secondary-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
