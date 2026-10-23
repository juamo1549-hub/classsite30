"use client";

import { useActionState } from "react";

import { saveHeroText, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { HeroText, HeroTextKey } from "@/lib/data";

const inputClass =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";
const textareaClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

const FIELDS: { key: HeroTextKey; label: string; multiline?: boolean; hint?: string }[] = [
  { key: "eyebrow", label: "작은 머리글" },
  { key: "title", label: "큰 제목", multiline: true, hint: "Enter 로 줄을 바꾸면 사이트에서도 줄이 바뀝니다." },
  { key: "description", label: "설명 문장", multiline: true },
  { key: "primaryLabel", label: "첫 번째 버튼 글자" },
  { key: "secondaryLabel", label: "두 번째 버튼 글자" },
];

/** 히어로 글자 수정 칸. values = 저장된 글자, defaults = 비워 뒀을 때 보일 site.config.ts 글자 */
export function HeroForm({ values, defaults }: { values: Partial<HeroText>; defaults: HeroText }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveHeroText, {});

  return (
    <form action={action} className="grid gap-4">
      {FIELDS.map((field) => (
        <label key={field.key} className="grid gap-1.5 text-sm">
          <span className="font-medium">{field.label}</span>
          {field.multiline ? (
            <textarea
              name={field.key}
              rows={3}
              defaultValue={values[field.key] ?? ""}
              placeholder={defaults[field.key]}
              className={textareaClass}
            />
          ) : (
            <input
              name={field.key}
              defaultValue={values[field.key] ?? ""}
              placeholder={defaults[field.key]}
              className={inputClass}
            />
          )}
          {field.hint ? <span className="text-xs text-muted-foreground">{field.hint}</span> : null}
        </label>
      ))}

      <p className="text-xs text-muted-foreground">
        칸을 비워 두면 흐리게 보이는 기본 글자(site.config.ts)가 사이트에 나옵니다.
      </p>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "히어로 저장"}
        </Button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
