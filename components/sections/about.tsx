import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { Window } from "@/components/ui/window";
import { ClassIllustration } from "@/components/ui/class-illustration";

/** 소개 섹션. 글자는 site.config.ts 의 about 에서 바꿉니다. (카드 머리줄 이름 = about.eyebrow) */
export function About() {
  const { about } = siteConfig;

  return (
    <section id="about" className="scroll-mt-16 py-16 sm:py-24">
      <Container>
        <Window
          title={about.eyebrow}
          bodyClassName="grid gap-10 p-6 sm:p-12 md:grid-cols-2 md:items-center"
        >
          <div>
            <SectionHeader title={about.title} />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              {about.paragraphs.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
          {/* 반 친구들 일러스트 (components/ui/class-illustration.tsx).
              사진으로 바꾸려면 public 폴더에 사진을 넣고 <img src="/사진이름.jpg" /> 로 바꿔 보세요 */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border-2 bg-teal shadow-hard-sm">
            <ClassIllustration label={about.imageAlt} className="size-full" />
          </div>
        </Window>
      </Container>
    </section>
  );
}
