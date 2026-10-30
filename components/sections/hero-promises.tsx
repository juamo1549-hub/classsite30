"use client";

import { useRef } from "react";
import { Pointer } from "lucide-react";

/* 히어로의 번호 목록 카드 (예: "지켜야 할 약속").
   - 제목 앞에 손가락 아이콘
   - 각 줄에 마우스를 올리면 글자가 크게 커지며 떠오르고, "삐삐" 경고음이 남
   - 경고음은 파일 없이 브라우저가 직접 만든 소리(Web Audio)입니다.
     브라우저 규칙상 페이지를 한 번이라도 클릭하거나 키를 누른 뒤부터 소리가 납니다. */

type Item = { number: string; text: string };

function useWarningBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  return () => {
    try {
      ctxRef.current ??= new AudioContext();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      // "삐-삐" 두 번 (사각파 = 경고음 느낌)
      [0, 0.16].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + delay;
        osc.type = "square";
        osc.frequency.setValueAtTime(i === 0 ? 880 : 660, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.14);
      });
    } catch {
      // 소리를 낼 수 없는 브라우저면 조용히 넘어감
    }
  };
}

export function HeroPromises({ heading, items }: { heading: string; items: Item[] }) {
  const beep = useWarningBeep();

  return (
    <div className="mt-8 max-w-2xl rounded-xl border-2 bg-card p-5 text-card-foreground shadow-hard-sm sm:p-6">
      {heading ? (
        <p className="mb-4 flex items-center gap-2 text-lg font-extrabold">
          <Pointer className="size-6 rotate-90 fill-yellow" aria-hidden />
          {heading}
        </p>
      ) : null}
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            onMouseEnter={beep}
            className="group flex cursor-default items-start gap-3 rounded-lg border-2 border-transparent px-3 py-2 text-base font-medium leading-relaxed transition-all duration-200 hover:z-10 hover:border-border hover:bg-yellow/40 motion-safe:hover:-translate-y-1.5 motion-safe:hover:shadow-hard-sm"
          >
            <span
              aria-hidden
              className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-yellow text-sm font-extrabold transition-colors group-hover:bg-orange"
            >
              {item.number}
            </span>
            {/* 글자 크기 자체를 키워서 박스 안에서 줄이 바뀌며 커짐.
                min-w-0 + flex-1 = 남은 폭 안에서만 줄바꿈 (박스 밖으로 안 나감) */}
            <span className="min-w-0 flex-1 break-words transition-all duration-200 group-hover:text-xl group-hover:font-extrabold">
              {item.text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
