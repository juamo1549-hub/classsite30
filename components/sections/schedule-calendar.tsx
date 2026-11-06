"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, CalendarCog, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

import { siteConfig } from "@/site.config";
import { deleteEvent, saveEvent, type ScheduleActionState } from "@/app/schedule/actions";
import type { EventCategory, ScheduleEvent } from "@/lib/types";
import { eventDateKeys, nextDateKey, seoulDateKey, seoulTime, toSeoulInputValue } from "@/lib/seoul-time";
import { Button } from "@/components/ui/button";
import { Popup } from "@/components/ui/popup";
import { cn } from "@/lib/utils";

/* 학급 일정 캘린더 (월별)
   - 위쪽 분류 버튼(전체·학교일정·평가일정·과제기한)을 누르면 그 일정만 보임
   - 여러 날짜에 걸친 일정은 시작 날짜부터 끝 날짜까지 한 줄 띠로 이어서 보임
   - 날짜에 마우스를 올리면(휴대폰은 누르면) 그날 일정 전체가 말풍선으로 보임
   - 권한이 있으면: 날짜에 마우스를 올릴 때 + 버튼 → 일정 추가 / 일정을 누르면 → 수정·삭제
   - 글자는 site.config.ts 의 schedule 에서 바꿉니다. */

const t = siteConfig.schedule;

/** 분류별 색 (색 자체는 app/globals.css 토큰) */
const CATEGORY_STYLE: Record<EventCategory, string> = {
  school: "bg-secondary text-secondary-foreground",
  exam: "bg-orange text-foreground",
  assignment: "bg-teal text-foreground",
};
const categoryLabel = (key: EventCategory) => t.categories.find((c) => c.key === key)?.label ?? key;

type Filter = "all" | EventCategory;
type Editor = { key: number; event?: ScheduleEvent; date?: string };

/** "2026-11-06" → "11/6" */
const shortDate = (key: string) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;

/** 일정 시간 글자: 같은 날이면 "09:00 ~ 12:00", 여러 날이면 "11/6 09:00 ~ 11/8 18:00" */
function timeRange(e: ScheduleEvent) {
  const s = seoulDateKey(e.starts_at);
  const en = seoulDateKey(e.ends_at);
  return s === en
    ? `${seoulTime(e.starts_at)} ~ ${seoulTime(e.ends_at)}`
    : `${shortDate(s)} ${seoulTime(e.starts_at)} ~ ${shortDate(en)} ${seoulTime(e.ends_at)}`;
}

/* ---------- 일정 추가·수정 창 내용 ---------- */

const inputClass =
  "h-11 w-full rounded-xl border-2 bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

function EventForm({
  editor,
  defaultCategory,
  onDone,
}: {
  editor: Editor;
  defaultCategory: EventCategory;
  onDone: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ScheduleActionState, FormData>(saveEvent, {});
  const [deleteState, setDeleteState] = useState<ScheduleActionState>({});
  const [deleting, startDelete] = useTransition();
  const handled = useRef<ScheduleActionState | null>(null);
  const e = editor.event;

  useEffect(() => {
    if (state.ok && handled.current !== state) {
      handled.current = state;
      onDone();
      router.refresh();
    }
  }, [state, onDone, router]);

  const date = editor.date ?? seoulDateKey(new Date());
  const message = deleteState.message ?? state.message;

  return (
    <form action={action} className="grid gap-4">
      {e ? <input type="hidden" name="id" value={e.id} /> : null}

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">분류</span>
        <select name="category" defaultValue={e?.category ?? defaultCategory} className={inputClass}>
          {t.categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">
          제목<span className="text-orange"> *</span>
        </span>
        <input name="title" required maxLength={80} defaultValue={e?.title ?? ""} placeholder="예: 2학기 중간고사" className={inputClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-bold">
            시작 시각<span className="text-orange"> *</span>
          </span>
          <input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={e ? toSeoulInputValue(e.starts_at) : `${date}T09:00`}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-bold">
            종료 시각<span className="text-orange"> *</span>
          </span>
          <input
            name="ends_at"
            type="datetime-local"
            required
            defaultValue={e ? toSeoulInputValue(e.ends_at) : `${date}T10:00`}
            className={inputClass}
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">메모</span>
        <textarea
          name="memo"
          rows={4}
          maxLength={1000}
          defaultValue={e?.memo ?? ""}
          placeholder="준비물, 범위, 장소 등"
          className="w-full rounded-xl border-2 bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || deleting}>
          {e ? <CalendarCog aria-hidden /> : <CalendarPlus aria-hidden />}
          {pending ? "저장 중..." : e ? t.editLabel : t.addLabel}
        </Button>
        {e ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending || deleting}
            onClick={() => {
              if (!confirm(`'${e.title}' 일정을 지울까요?`)) return;
              startDelete(async () => {
                const result = await deleteEvent(e.id);
                setDeleteState(result);
                if (result.ok) {
                  onDone();
                  router.refresh();
                }
              });
            }}
          >
            <Trash2 aria-hidden />
            {t.deleteLabel}
          </Button>
        ) : null}
        {message ? (
          <p role="status" className={cn("text-sm font-bold", !(deleteState.ok ?? state.ok) && "text-destructive")}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/* ---------- 캘린더 ---------- */

/** 한 주(7칸) 안의 일정 띠 하나: start~end 칸, lane = 위에서 몇 번째 줄 */
type Segment = {
  event: ScheduleEvent;
  start: number;
  end: number;
  lane: number;
  /** 지난주부터 이어져 옴 / 다음 주로 이어짐 */
  fromPrev: boolean;
  toNext: boolean;
};

/** 한 칸에 보여 줄 일정 띠 줄 수 (넘치면 "+N") */
const MAX_LANES = 3;

/** 한 주에 걸친 일정들을 띠로 바꾸고, 서로 겹치지 않게 줄을 나눔 (긴 일정이 위로) */
function weekSegments(week: string[], events: ScheduleEvent[]): Segment[] {
  const first = week[0];
  const last = week[6];
  const raw = events
    .map((event) => {
      const s = seoulDateKey(event.starts_at);
      const e = seoulDateKey(event.ends_at);
      if (e < first || s > last) return null;
      return {
        event,
        start: s < first ? 0 : week.indexOf(s),
        end: e > last ? 6 : week.indexOf(e),
        fromPrev: s < first,
        toNext: e > last,
      };
    })
    .filter((r) => r !== null)
    .sort(
      (a, b) =>
        a.start - b.start || b.end - b.start - (a.end - a.start) || a.event.starts_at.localeCompare(b.event.starts_at)
    );

  const laneEnds: number[] = [];
  return raw.map((r) => {
    let lane = laneEnds.findIndex((end) => end < r.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(r.end);
    } else {
      laneEnds[lane] = r.end;
    }
    return { ...r, lane };
  });
}

export function ScheduleCalendar({
  events,
  todayKey,
  canEdit,
}: {
  events: ScheduleEvent[];
  /** 오늘 날짜 (서버에서 한국 시간으로 계산해서 넘겨줌) */
  todayKey: string;
  canEdit: boolean;
}) {
  const [month, setMonth] = useState({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) });
  const [filter, setFilter] = useState<Filter>("all");
  const [editor, setEditor] = useState<Editor | null>(null);
  /** 마우스가 올라가 있는 날짜 (몇째 주, 몇째 칸) */
  const [hover, setHover] = useState<{ week: number; col: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const shown = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.category === filter)),
    [events, filter]
  );

  // 날짜별 일정 (말풍선용, 시작 시각 순)
  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const e of shown) {
      for (const key of eventDateKeys(e.starts_at, e.ends_at)) {
        map.set(key, [...(map.get(key) ?? []), e]);
      }
    }
    return map;
  }, [shown]);

  // 이번 달 달력을 주(7일) 단위로 (앞뒤 달 날짜 포함, 5~6주)
  const weeks = useMemo(() => {
    const first = new Date(Date.UTC(month.y, month.m - 1, 1));
    const keys = [new Date(Date.UTC(month.y, month.m - 1, 1 - first.getUTCDay())).toISOString().slice(0, 10)];
    while (keys.length < 42) keys.push(nextDateKey(keys[keys.length - 1]));
    const rows = Array.from({ length: 6 }, (_, i) => keys.slice(i * 7, i * 7 + 7));
    // 마지막 주가 통째로 다음 달이면 빼기
    return Number(rows[5][0].slice(5, 7)) !== month.m ? rows.slice(0, 5) : rows;
  }, [month]);

  const segmentsByWeek = useMemo(() => weeks.map((week) => weekSegments(week, shown)), [weeks, shown]);

  const moveMonth = (delta: number) => {
    setHover(null);
    setMonth(({ y, m }) => {
      const d = new Date(Date.UTC(y, m - 1 + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
    });
  };

  const openEditor = (next: Omit<Editor, "key">) => {
    setEditor({ key: Date.now(), ...next });
    // 창 안 내용이 바뀐 뒤 열기
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  /** 마우스 위치로 몇째 칸인지 계산 (일정 띠 위에 있어도 그 아래 날짜를 알 수 있게) */
  const pointAt = (week: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.min(6, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 7)));
    setHover((h) => (h?.week === week && h.col === col ? h : { week, col }));
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.allLabel },
    ...t.categories.map((c) => ({ key: c.key as EventCategory, label: c.label })),
  ];

  return (
    <>
      {/* 분류 버튼 */}
      <div role="group" aria-label="일정 분류" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold shadow-hard-sm transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-yellow"
              )}
            >
              {f.key !== "all" ? (
                <span className={cn("size-3 rounded-full border-2", CATEGORY_STYLE[f.key])} aria-hidden />
              ) : null}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 달 넘기기 */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="outline" aria-label="이전 달" onClick={() => moveMonth(-1)}>
            <ChevronLeft />
          </Button>
          <p className="min-w-32 text-center text-xl font-extrabold">
            {month.y}년 {month.m}월
          </p>
          <Button type="button" size="icon" variant="outline" aria-label="다음 달" onClick={() => moveMonth(1)}>
            <ChevronRight />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="accent"
            onClick={() => {
              setHover(null);
              setMonth({ y: Number(todayKey.slice(0, 4)), m: Number(todayKey.slice(5, 7)) });
            }}
          >
            {t.todayLabel}
          </Button>
          {canEdit ? (
            <Button type="button" size="sm" onClick={() => openEditor({ date: todayKey })}>
              <CalendarPlus aria-hidden />
              {t.addLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {canEdit ? <p className="mt-2 text-xs text-muted-foreground">{t.editHint}</p> : null}

      {/* 달력 */}
      <div className="mt-4 rounded-xl border-2">
        <div className="grid grid-cols-7 border-b-2 bg-secondary text-center text-xs font-bold text-secondary-foreground">
          {t.weekdays.map((w, i) => (
            <span key={w} className={cn("py-2", i === 0 && "text-yellow")}>
              {w}
            </span>
          ))}
        </div>

        <div role="grid" aria-label={`${month.y}년 ${month.m}월 일정`}>
          {weeks.map((week, wi) => {
            const segments = segmentsByWeek[wi];
            const hoverKey = hover?.week === wi ? week[hover.col] : null;
            const hoverEvents = hoverKey ? (byDay.get(hoverKey) ?? []) : [];

            return (
              <div
                key={week[0]}
                role="row"
                onMouseMove={(e) => pointAt(wi, e)}
                onMouseLeave={() => setHover(null)}
                onClick={(e) => pointAt(wi, e)}
                className={cn("relative grid grid-cols-7", wi < weeks.length - 1 && "border-b-2")}
              >
                {/* 날짜 칸 */}
                {week.map((key, col) => {
                  const inMonth = Number(key.slice(5, 7)) === month.m;
                  const isToday = key === todayKey;
                  const active = hover?.week === wi && hover.col === col;
                  const count = byDay.get(key)?.length ?? 0;
                  return (
                    <div
                      key={key}
                      role="gridcell"
                      tabIndex={count > 0 ? 0 : -1}
                      aria-label={`${Number(key.slice(5, 7))}월 ${Number(key.slice(8, 10))}일, 일정 ${count}개`}
                      onFocus={() => setHover({ week: wi, col })}
                      onBlur={() => setHover(null)}
                      className={cn(
                        "min-h-16 p-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-32 sm:p-1.5",
                        col < 6 && "border-r-2",
                        !inMonth && "bg-muted/60 text-muted-foreground",
                        active && "bg-yellow/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold sm:size-7 sm:text-sm",
                            isToday && "border-2 bg-primary text-primary-foreground",
                            !isToday && col === 0 && inMonth && "text-orange"
                          )}
                        >
                          {Number(key.slice(8, 10))}
                        </span>
                        {canEdit ? (
                          <button
                            type="button"
                            aria-label={`${shortDate(key)} ${t.addLabel}`}
                            onClick={() => openEditor({ date: key })}
                            className={cn(
                              "relative z-20 inline-flex size-6 items-center justify-center rounded-full border-2 bg-yellow shadow-hard-sm transition-opacity focus-visible:opacity-100",
                              active ? "opacity-100" : "sm:opacity-0"
                            )}
                          >
                            <Plus className="size-3.5" aria-hidden />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {/* 일정 띠: 시작 날짜부터 끝 날짜까지 한 줄로 이어짐 (주가 바뀌면 다음 주 줄에서 이어짐) */}
                <div className="pointer-events-none absolute inset-x-0 top-8 grid auto-rows-[0.375rem] grid-cols-7 gap-y-0.5 sm:top-10 sm:auto-rows-[1.25rem] sm:gap-y-1">
                  {segments
                    .filter((s) => s.lane < MAX_LANES)
                    .map((s) => {
                      const e = s.event;
                      const label = `${s.fromPrev ? "" : `${seoulTime(e.starts_at)} `}${e.title}`;
                      const className = cn(
                        "flex min-w-0 items-center overflow-hidden border-2 px-1.5 text-left text-[0.7rem] font-bold leading-none",
                        CATEGORY_STYLE[e.category],
                        s.fromPrev ? "rounded-l-none border-l-0" : "ml-0.5 rounded-l-md sm:ml-1",
                        s.toNext ? "rounded-r-none border-r-0" : "mr-0.5 rounded-r-md sm:mr-1"
                      );
                      const style = { gridColumn: `${s.start + 1} / ${s.end + 2}`, gridRow: s.lane + 1 };
                      const text = <span className="hidden truncate sm:inline">{label}</span>;
                      return canEdit ? (
                        <button
                          key={e.id}
                          type="button"
                          title={`${e.title} (${timeRange(e)})`}
                          onClick={() => openEditor({ event: e, date: week[s.start] })}
                          style={style}
                          className={cn(className, "pointer-events-auto hover:brightness-110")}
                        >
                          {text}
                        </button>
                      ) : (
                        <span key={e.id} style={style} className={className}>
                          {text}
                        </span>
                      );
                    })}
                  {/* 넘친 일정 수 */}
                  {week.map((key, col) => {
                    const more = segments.filter((s) => s.lane >= MAX_LANES && s.start <= col && s.end >= col).length;
                    return more > 0 ? (
                      <span
                        key={key}
                        style={{ gridColumn: col + 1, gridRow: MAX_LANES + 1 }}
                        className="hidden px-1.5 text-[0.7rem] font-bold text-muted-foreground sm:block"
                      >
                        +{more}개 더
                      </span>
                    ) : null;
                  })}
                </div>

                {/* 마우스를 올린 날짜의 일정 전체 */}
                {hoverKey && hover && hoverEvents.length > 0 ? (
                  <div
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute z-30 w-64 rounded-xl border-2 bg-card p-3 text-left text-card-foreground shadow-hard",
                      wi >= 3 ? "bottom-full mb-1" : "top-full mt-1"
                    )}
                    style={
                      hover.col >= 4
                        ? { right: `${((6 - hover.col) / 7) * 100}%` }
                        : { left: `${(hover.col / 7) * 100}%` }
                    }
                  >
                    <p className="mb-2 text-sm font-extrabold">
                      {Number(hoverKey.slice(5, 7))}월 {Number(hoverKey.slice(8, 10))}일 ({t.weekdays[hover.col]})
                    </p>
                    <ul className="space-y-2.5">
                      {hoverEvents.map((e) => (
                        <li key={e.id} className="text-xs">
                          <p className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "shrink-0 rounded-full border-2 px-1.5 py-0.5 text-[0.65rem] font-bold",
                                CATEGORY_STYLE[e.category]
                              )}
                            >
                              {categoryLabel(e.category)}
                            </span>
                            <span className="font-extrabold">{e.title}</span>
                          </p>
                          <p className="mt-0.5 font-bold text-muted-foreground">{timeRange(e)}</p>
                          {e.memo ? <p className="mt-0.5 whitespace-pre-line leading-relaxed">{e.memo}</p> : null}
                          {e.created_by ? (
                            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">작성: {e.created_by}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {canEdit ? (
        <Popup
          dialogRef={dialogRef}
          title={editor?.event ? t.editLabel : t.addLabel}
          closeLabel={t.closeLabel}
          Icon={editor?.event ? CalendarCog : CalendarPlus}
        >
          {editor ? (
            <EventForm
              key={editor.key}
              editor={editor}
              defaultCategory={filter === "all" ? "school" : filter}
              onDone={() => dialogRef.current?.close()}
            />
          ) : null}
        </Popup>
      ) : null}
    </>
  );
}
