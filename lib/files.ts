/* 파일 이름·다운로드 주소 도우미 (서버와 브라우저 양쪽에서 함께 씀) */

/** "체육대회.jpg" → { name: "체육대회", ext: "JPG" } */
export function splitFileName(full: string): { name: string; ext: string | null } {
  const dot = full.lastIndexOf(".");
  if (dot <= 0 || dot === full.length - 1) return { name: full, ext: null };
  return { name: full.slice(0, dot), ext: full.slice(dot + 1).toUpperCase() };
}

/** Supabase 저장소 주소에 ?download= 를 붙이면 브라우저가 열지 않고 내려받음
    (fileName 을 주면 그 이름으로 저장됨 — 예: 체육대회.jpg) */
export function downloadUrl(url: string, fileName?: string) {
  fileName ||= url.split("/").pop()?.split("?")[0] ?? "download";
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(fileName)}`;
}
