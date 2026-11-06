"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { createPost, prepareUpload } from "@/app/gallery/actions";
import { getPublicClient } from "@/lib/supabase";
import { IMAGE_BUCKET_NAME } from "@/lib/storage";
import { Button } from "@/components/ui/button";

/* 갤러리 피드의 '글쓰기' 입력 칸 (승인된 회원만). 오른쪽 아래 글쓰기 버튼을 누르면 뜨는 창 안에 들어감.
   올린 사람 이름은 로그인한 회원 이름으로 자동 저장.
   올리는 순서: ① 서버에 1회용 업로드 주소 받기 → ② 파일을 Supabase 저장소에 바로 올리기 → ③ 게시물 저장(바로 보임) */

const inputClass =
  "h-11 w-full rounded-xl border-2 bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

export function GalleryUploadForm({ hint, authorName }: { hint: string; authorName: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<{ url: string; video: boolean } | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setStatus({ ok: false, message: "사진이나 동영상을 골라 주세요." });
      return;
    }

    setBusy(true);
    setStatus({ ok: true, message: "올리는 중이에요... 동영상은 조금 걸릴 수 있어요." });
    try {
      const ticket = await prepareUpload({ name: file.name, type: file.type, size: file.size });
      if (!ticket.ok) throw new Error(ticket.message);

      const supabase = getPublicClient();
      if (!supabase) throw new Error("지금은 올릴 수 없어요. (Supabase 연결 필요)");
      const { error } = await supabase.storage
        .from(IMAGE_BUCKET_NAME)
        .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
      if (error) throw new Error(`파일 올리기 실패: ${error.message}`);

      const result = await createPost({
        title: String(form.get("title") ?? ""),
        content: String(form.get("content") ?? ""),
        path: ticket.path,
        mediaType: ticket.mediaType,
        originalName: file.name,
      });
      setStatus(result);
      if (result.ok) {
        formRef.current?.reset();
        setPreview(null);
      }
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : "올리지 못했어요." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-4">
      <p className="text-sm text-muted-foreground">{hint}</p>

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">사진 또는 동영상 *</span>
        <input
          name="file"
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          required
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (preview) URL.revokeObjectURL(preview.url);
            setPreview(f ? { url: URL.createObjectURL(f), video: f.type.startsWith("video/") } : null);
          }}
          className="text-sm file:mr-3 file:rounded-full file:border-2 file:border-border file:bg-yellow file:px-4 file:py-1.5 file:font-bold"
        />
      </label>
      {preview ? (
        <div className="overflow-hidden rounded-xl border-2 bg-muted">
          {preview.video ? (
            <video src={preview.url} controls playsInline className="max-h-80 w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- 내 컴퓨터 파일 미리보기라 next/image 를 쓸 수 없음
            <img src={preview.url} alt="올릴 사진 미리보기" className="max-h-80 w-full object-contain" />
          )}
        </div>
      ) : null}

      <p className="text-sm">
        <span className="font-bold">작성자</span> {authorName}
      </p>

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">제목</span>
        <input name="title" maxLength={80} placeholder="예: 체육대회 날!" className={inputClass} />
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="font-bold">내용</span>
        <textarea
          name="content"
          rows={3}
          maxLength={2000}
          placeholder="어떤 순간이었는지 적어 주세요."
          className="w-full rounded-xl border-2 bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          <Upload aria-hidden />
          {busy ? "올리는 중..." : "올리기"}
        </Button>
        {status ? (
          <p role="status" className={status.ok ? "text-sm font-bold" : "text-sm font-bold text-destructive"}>
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
