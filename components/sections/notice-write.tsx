"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";

import { siteConfig } from "@/site.config";
import { createNotice, prepareNoticeUpload } from "@/app/notice/actions";
import { IMAGE_BUCKET_NAME } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Popup } from "@/components/ui/popup";
import { AttachmentWriteForm } from "@/components/ui/attachment-write-form";

/* 공지사항 글쓰기 버튼(공지사항 페이지 오른쪽 위) + 전체 화면 글쓰기 창 (제목 · 내용 · 파일 첨부)
   - 이 버튼은 관리자와 '공지 권한'을 받은 회원에게만 보임 (서버에서도 한 번 더 확인)
   - 첨부 파일은 공개 저장 공간이라 공지사항을 보는 누구나 내려받을 수 있음 */

const t = siteConfig.notice;

export function NoticeWrite() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <>
      <Button
        type="button"
        aria-label={t.writeLabel}
        onClick={() => {
          setFormKey((k) => k + 1);
          dialogRef.current?.showModal();
        }}
      >
        <PenLine aria-hidden />
        <span className="hidden sm:inline">{t.writeLabel}</span>
      </Button>

      <Popup dialogRef={dialogRef} title={t.writeTitle} closeLabel={t.closeLabel} Icon={PenLine} fullScreen>
        <AttachmentWriteForm
          key={formKey}
          bucket={IMAGE_BUCKET_NAME}
          prepareUpload={prepareNoticeUpload}
          submit={createNotice}
          onDone={() => router.refresh()}
          labels={{
            titlePlaceholder: "예: 11월 현장체험학습 안내",
            contentPlaceholder: "공지할 내용을 적어 주세요.",
            fileHint: t.fileHint,
            submitLabel: t.submitLabel,
            againLabel: "공지사항 하나 더 쓰기",
          }}
        />
      </Popup>
    </>
  );
}
