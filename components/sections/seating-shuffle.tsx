"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";

import { siteConfig } from "@/site.config";
import { shuffleSeats } from "@/app/seating/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* 자리배치도의 [랜덤 자리 바꾸기] 버튼 (관리자에게만 보임, 서버에서도 한 번 더 확인) */
export function SeatingShuffle() {
  const t = siteConfig.seating;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        aria-label={t.shuffleLabel}
        disabled={pending}
        onClick={() => {
          if (!confirm(t.shuffleConfirm)) return;
          start(async () => {
            const result = await shuffleSeats();
            setMessage({ ok: result.ok, text: result.message });
            if (result.ok) router.refresh();
          });
        }}
      >
        <Shuffle className={cn(pending && "animate-spin")} aria-hidden />
        <span className="hidden sm:inline">{pending ? "섞는 중..." : t.shuffleLabel}</span>
      </Button>
      {message ? (
        <p role="status" className={cn("text-xs font-bold", !message.ok && "text-destructive")}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
