/* To teacher! 파일 규칙 (서버와 브라우저 양쪽에서 함께 씀) */

/** 잠긴(비공개) 저장 공간 이름 — supabase/schema.sql 과 같아야 함 */
export const SUBMISSION_BUCKET = "submissions";
export const SUBMISSION_MAX_FILES = 5;
export const SUBMISSION_MAX_BYTES = 20 * 1024 * 1024; // 20MB
/** 올릴 수 있는 파일 종류 (확장자) */
export const SUBMISSION_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "webp", "heic",
  "pdf", "hwp", "hwpx", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt",
  "zip", "mp4", "mov",
];

/** 12345678 → "11.8MB" */
export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}
