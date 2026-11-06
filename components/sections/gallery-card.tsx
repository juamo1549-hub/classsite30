import Image from "next/image";
import { ArrowUpRight, ImageIcon } from "lucide-react";

import type { Item } from "@/lib/types";
import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

/* 갤러리 카드 한 장 (사진 + 제목 + 설명).
   첫 화면 미리보기(features.tsx)와 갤러리 창(gallery-viewer.tsx)이 같은 모양을 함께 씁니다.
   - full = 갤러리 창용: 설명을 자르지 않고 전부 보여줌 (미리보기는 3줄까지) */

/** 카드 색을 차례대로 돌아가며 사용 (색 자체는 app/globals.css 토큰) */
const CARD_COLORS = [
  "bg-yellow",
  "bg-teal",
  "bg-secondary text-secondary-foreground",
  "bg-card",
];

export function GalleryCard({ item, index, full }: { item: Item; index: number; full?: boolean }) {
  const card = (
    <Window
      className={cn(
        "group h-full transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5",
        CARD_COLORS[index % CARD_COLORS.length]
      )}
      bodyClassName="h-full p-4"
    >
      <article>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-card text-card-foreground">
          {item.image_url && item.media_type === "video" ? (
            <video
              src={item.image_url}
              muted
              playsInline
              controls
              preload="metadata"
              className="size-full bg-foreground object-cover"
            />
          ) : item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-8" aria-hidden />
            </div>
          )}
        </div>
        <div className="px-2 pb-2 pt-5">
          <h3 className="flex items-center justify-between gap-2 text-lg font-extrabold">
            {item.title}
            {item.link_url ? (
              <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            ) : null}
          </h3>
          {item.description ? (
            <p
              className={cn(
                "mt-2 whitespace-pre-line text-sm font-medium leading-relaxed opacity-80",
                !full && "line-clamp-3"
              )}
            >
              {item.description}
            </p>
          ) : null}
        </div>
      </article>
    </Window>
  );

  return item.link_url ? (
    <a href={item.link_url} target="_blank" rel="noreferrer" className="block h-full">
      {card}
    </a>
  ) : (
    <div className="h-full">{card}</div>
  );
}
