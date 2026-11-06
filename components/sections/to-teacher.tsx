import { Lock } from "lucide-react";

import { siteConfig } from "@/site.config";
import type { SessionMember } from "@/lib/types";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { Window } from "@/components/ui/window";
import { ToTeacherWrite } from "@/components/sections/to-teacher-write";

/* To teacher! 섹션 (예전 '연락처' 자리)
   - 선생님께만 보내는 글·파일. 홈페이지에는 올라가지 않음
     선생님은 관리자 페이지 'To teacher!' 탭, 보낸 학생은 마이페이지에서만 볼 수 있음
   - 글자: site.config.ts 의 toTeacher */
export function ToTeacher({ member }: { member: SessionMember | null }) {
  const { toTeacher } = siteConfig;

  return (
    <section id="to-teacher" className="scroll-mt-16 py-16 sm:py-24">
      <Container>
        <Window title={toTeacher.eyebrow} className="bg-yellow" bodyClassName="px-6 py-16 text-center sm:px-12">
          <SectionHeader title={toTeacher.title} description={toTeacher.description} className="mx-auto" />
          <p className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border-2 bg-card px-3 py-1 text-xs font-bold">
            <Lock className="size-3.5" aria-hidden />
            선생님과 나만 볼 수 있어요
          </p>
          <div className="mt-8 flex justify-center">
            <ToTeacherWrite member={member} />
          </div>
        </Window>
      </Container>
    </section>
  );
}
