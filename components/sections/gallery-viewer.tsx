import { ExternalLink } from "lucide-react";

/* 갤러리 섹션 머리말.
   - 제목("갤러리")과 '전체 보기'를 누르면 새 탭에서 갤러리 피드 페이지(/gallery)가 열림
   - 글자는 site.config.ts 의 features 에서 가져옵니다. (features.tsx 에서 넘겨줌) */
export const GALLERY_PAGE_HREF = "/gallery";

export function GalleryViewer({
  eyebrow,
  title,
  description,
  openHint,
}: {
  eyebrow: string;
  title: string;
  description: string;
  openHint: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="inline-block rounded-full border-2 bg-secondary px-3 py-0.5 text-xs font-bold uppercase tracking-[0.2em] text-secondary-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-3">
        <a
          href={GALLERY_PAGE_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          <span className="underline decoration-4 decoration-transparent underline-offset-8 transition-colors group-hover:decoration-orange">
            {title}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 bg-yellow px-3 py-1 text-sm font-bold shadow-hard-sm transition-all group-hover:-translate-y-0.5 group-active:translate-x-[3px] group-active:translate-y-[3px] group-active:shadow-none">
            <ExternalLink className="size-4" aria-hidden />
            {openHint}
          </span>
        </a>
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
