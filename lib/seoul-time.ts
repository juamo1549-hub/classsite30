/* 한국 시간(Asia/Seoul) 날짜 도우미 — 서버(Vercel은 영국 시간)와 브라우저가 같은 날짜를 보도록
   모든 날짜 계산을 한국 시간 기준으로 함. 캘린더와 일정 저장에서 함께 씀. */

const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** 한국 시간으로 나눈 연·월·일·시·분 (모두 글자, 두 자리) */
export function seoulParts(date: Date | string) {
  const parts = Object.fromEntries(
    PARTS.formatToParts(typeof date === "string" ? new Date(date) : date).map((p) => [p.type, p.value])
  );
  return { y: parts.year, m: parts.month, d: parts.day, hh: parts.hour, mm: parts.minute };
}

/** "2026-11-06" (한국 날짜) */
export function seoulDateKey(date: Date | string) {
  const { y, m, d } = seoulParts(date);
  return `${y}-${m}-${d}`;
}

/** "14:30" (한국 시각) */
export function seoulTime(date: Date | string) {
  const { hh, mm } = seoulParts(date);
  return `${hh}:${mm}`;
}

/** 입력 칸(datetime-local)에 넣을 "2026-11-06T14:30" */
export function toSeoulInputValue(date: Date | string) {
  const { y, m, d, hh, mm } = seoulParts(date);
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

/** 입력 칸 값 "2026-11-06T14:30" 을 한국 시간으로 보고 저장용 시각 글자로 ("…+09:00") */
export function seoulInputToIso(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00+09:00` : null;
}

/** "2026-11-06" → 그 다음 날 "2026-11-07" (달력 계산용, 시간대 영향 없음) */
export function nextDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

/** 일정이 걸쳐 있는 모든 날짜 (예: 11/6~11/8 → 3일). 너무 긴 일정은 62일까지만 */
export function eventDateKeys(startsAt: string, endsAt: string) {
  const keys: string[] = [];
  const end = seoulDateKey(endsAt);
  let key = seoulDateKey(startsAt);
  while (keys.length < 62) {
    keys.push(key);
    if (key >= end) break;
    key = nextDateKey(key);
  }
  return keys;
}
