"use client";

import { useRef, useState } from "react";
import { PenLine } from "lucide-react";

import { siteConfig } from "@/site.config";
import { prepareSubmissionUpload, sendSubmission } from "@/app/submissions/actions";
import { SUBMISSION_BUCKET } from "@/lib/submission-rules";
import type { SessionMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popup } from "@/components/ui/popup";
import { AttachmentWriteForm } from "@/components/ui/attachment-write-form";

/* To teacher! 글쓰기 버튼 + 전체 화면 글쓰기 창 (제목 · 내용 · 파일 올리기)
   - 승인된 회원만 보낼 수 있음 (아니면 창 안에 안내 문구)
   - 파일은 잠긴 저장 공간(submissions)으로 — 선생님과 보낸 학생 본인만 내려받을 수 있음 */

const t = siteConfig.toTeacher;

export function ToTeacherWrite({ member }: { member: SessionMember | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => {
          setFormKey((k) => k + 1);
          dialogRef.current?.showModal();
        }}
      >
        <PenLine aria-hidden />
        {t.writeLabel}
      </Button>

      <Popup dialogRef={dialogRef} title={t.writeTitle} closeLabel={t.closeLabel} Icon={PenLine} fullScreen>
        {member?.status === "approved" ? (
          <AttachmentWriteForm
            key={formKey}
            bucket={SUBMISSION_BUCKET}
            prepareUpload={prepareSubmissionUpload}
            submit={sendSubmission}
            labels={{
              titlePlaceholder: "예: 3단원 수학 숙제 제출합니다",
              contentPlaceholder: "선생님께 하고 싶은 말을 적어 주세요.",
              fileHint: t.fileHint,
              warning: t.sendWarning,
              submitLabel: t.sendLabel,
              againLabel: "하나 더 보내기",
            }}
          />
        ) : (
          <p className="rounded-xl border-2 border-dashed px-5 py-10 text-center font-bold">
            {member ? t.pendingText : t.loginRequiredText}
          </p>
        )}
      </Popup>
    </>
  );
}
