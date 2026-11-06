"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";

import { IMAGE_BUCKET_NAME } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Popup } from "@/components/ui/popup";
import { AttachmentWriteForm, type UploadedFile } from "@/components/ui/attachment-write-form";

/* 게시판 글쓰기 버튼(오른쪽 위) + 전체 화면 글쓰기 창 (제목 · 내용 · 파일 첨부) — 공지사항, 자료실 공용
   - 누가 쓸 수 있는지는 페이지(서버)에서 확인해서, 쓸 수 있는 사람에게만 이 버튼을 보여줌
   - 저장(prepareUpload, submit)은 각 게시판의 actions.ts 함수를 넘겨받음 */

type Ticket = { ok: true; path: string; token: string } | { ok: false; message: string };
type Result = { ok: boolean; message: string };

export function BoardWrite({
  labels,
  prepareUpload,
  submit,
}: {
  labels: {
    writeLabel: string;
    writeTitle: string;
    submitLabel: string;
    closeLabel: string;
    fileHint: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    againLabel: string;
  };
  prepareUpload: (file: { name: string; size: number }) => Promise<Ticket>;
  submit: (input: { title: string; content: string; files: UploadedFile[] }) => Promise<Result>;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <>
      <Button
        type="button"
        aria-label={labels.writeLabel}
        onClick={() => {
          setFormKey((k) => k + 1);
          dialogRef.current?.showModal();
        }}
      >
        <PenLine aria-hidden />
        <span className="hidden sm:inline">{labels.writeLabel}</span>
      </Button>

      <Popup dialogRef={dialogRef} title={labels.writeTitle} closeLabel={labels.closeLabel} Icon={PenLine} fullScreen>
        <AttachmentWriteForm
          key={formKey}
          bucket={IMAGE_BUCKET_NAME}
          prepareUpload={prepareUpload}
          submit={submit}
          onDone={() => router.refresh()}
          labels={{
            titlePlaceholder: labels.titlePlaceholder,
            contentPlaceholder: labels.contentPlaceholder,
            fileHint: labels.fileHint,
            submitLabel: labels.submitLabel,
            againLabel: labels.againLabel,
          }}
        />
      </Popup>
    </>
  );
}
