"use client";

import { useRef, useState } from "react";
import { FileUp, PenLine, Send, X } from "lucide-react";

import { getPublicClient } from "@/lib/supabase";
import {
  SUBMISSION_EXTENSIONS,
  SUBMISSION_MAX_BYTES,
  SUBMISSION_MAX_FILES,
  formatBytes,
} from "@/lib/submission-rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* 제목 · 내용 · 파일 첨부 글쓰기 칸 (공용) — To teacher! 와 공지사항에서 함께 씀
   보내는 순서: ① 파일마다 1회용 업로드 주소 받기(prepareUpload) → ② 저장 공간(bucket)에 바로 올리기 → ③ 글 저장(submit)
   파일 규칙(종류·크기·개수)은 lib/submission-rules.ts */

export type UploadedFile = { path: string; name: string; size: number; type: string };
type Ticket = { ok: true; path: string; token: string } | { ok: false; message: string };
type Result = { ok: boolean; message: string };

const inputClass =
  "h-11 w-full rounded-xl border-2 bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

export function AttachmentWriteForm({
  bucket,
  prepareUpload,
  submit,
  labels,
  onDone,
}: {
  /** 파일을 올릴 저장 공간 이름 */
  bucket: string;
  prepareUpload: (file: { name: string; size: number }) => Promise<Ticket>;
  submit: (input: { title: string; content: string; files: UploadedFile[] }) => Promise<Result>;
  labels: {
    titlePlaceholder: string;
    contentPlaceholder: string;
    fileHint: string;
    submitLabel: string;
    /** 보내기 전 주의 문구 (없으면 안 보임) */
    warning?: string;
    againLabel: string;
  };
  /** 저장에 성공한 뒤 할 일 (예: 화면 새로고침) */
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      const ext = (f.name.split(".").pop() ?? "").toLowerCase();
      if (!SUBMISSION_EXTENSIONS.includes(ext)) {
        setStatus({ ok: false, message: `'${f.name}' 은(는) 올릴 수 없는 파일 종류예요.` });
        continue;
      }
      if (f.size > SUBMISSION_MAX_BYTES) {
        setStatus({ ok: false, message: `'${f.name}' 이(가) 20MB보다 커요.` });
        continue;
      }
      if (next.length >= SUBMISSION_MAX_FILES) {
        setStatus({ ok: false, message: `파일은 ${SUBMISSION_MAX_FILES}개까지 올릴 수 있어요.` });
        break;
      }
      next.push(f);
    }
    setFiles(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setStatus({ ok: true, message: files.length > 0 ? "파일을 올리는 중이에요..." : "저장하는 중이에요..." });
    try {
      const supabase = getPublicClient();
      const uploaded: UploadedFile[] = [];
      for (const file of files) {
        const ticket = await prepareUpload({ name: file.name, size: file.size });
        if (!ticket.ok) throw new Error(ticket.message);
        if (!supabase) throw new Error("지금은 올릴 수 없어요. (Supabase 연결 필요)");
        const { error } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type || undefined });
        if (error) throw new Error(`'${file.name}' 올리기 실패: ${error.message}`);
        uploaded.push({ path: ticket.path, name: file.name, size: file.size, type: file.type });
      }

      const result = await submit({
        title: String(form.get("title") ?? ""),
        content: String(form.get("content") ?? ""),
        files: uploaded,
      });
      setStatus(result);
      if (result.ok) {
        formRef.current?.reset();
        setFiles([]);
        setSent(true);
        onDone?.();
      }
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : "저장하지 못했어요." });
    } finally {
      setBusy(false);
    }
  }

  if (sent && status?.ok) {
    return (
      <div className="grid gap-4">
        <p className="rounded-xl border-2 bg-yellow/40 p-5 font-bold">{status.message}</p>
        <Button type="button" variant="outline" onClick={() => setSent(false)} className="justify-self-start">
          <PenLine aria-hidden />
          {labels.againLabel}
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-5">
      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">
          제목<span className="text-orange"> *</span>
        </span>
        <input name="title" required maxLength={100} placeholder={labels.titlePlaceholder} className={inputClass} />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">내용</span>
        <textarea
          name="content"
          rows={10}
          maxLength={5000}
          placeholder={labels.contentPlaceholder}
          className="w-full rounded-xl border-2 bg-card px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/50"
        />
      </label>

      {/* 파일 첨부 */}
      <div className="grid gap-2 text-sm">
        <span className="font-bold">파일 첨부</span>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-muted/50 px-4 py-8 text-center transition-colors hover:bg-yellow/30"
        >
          <FileUp className="size-8" aria-hidden />
          <span className="font-bold">눌러서 파일 고르기 (또는 여기로 끌어다 놓기)</span>
          <span className="text-xs text-muted-foreground">{labels.fileHint}</span>
          <input
            type="file"
            multiple
            accept={SUBMISSION_EXTENSIONS.map((e) => `.${e}`).join(",")}
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {files.length > 0 ? (
          <ul className="divide-y-2 rounded-xl border-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  aria-label={`${f.name} 빼기`}
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="inline-flex size-7 items-center justify-center rounded-full border-2 hover:bg-yellow"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {labels.warning ? (
        <p className="rounded-xl border-2 border-dashed px-4 py-3 text-sm font-bold">⚠ {labels.warning}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          <Send aria-hidden />
          {busy ? "저장하는 중..." : labels.submitLabel}
        </Button>
        {status ? (
          <p role="status" className={cn("text-sm font-bold", !status.ok && "text-destructive")}>
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
