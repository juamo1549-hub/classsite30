import { BookOpen, FolderOpen, Megaphone, MessagesSquare, OctagonAlert } from "lucide-react";

import { siteConfig } from "@/site.config";
import { getHeroText } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/ui/window";
import { ClassIllustration } from "@/components/ui/class-illustration";
import { HeroPromises } from "@/components/sections/hero-promises";

/* 첫 화면(히어로). 큰 주황 카드 하나 안에 제목·설명·버튼.
   - 글자는 관리자 페이지(/admin)의 '히어로' 탭에서 바꿉니다.
     거기서 비워 둔 칸은 site.config.ts 의 hero 글자가 보입니다.
   - 카드 머리줄 이름은 site.config.ts 의 name 입니다.
   - 버튼이 이동할 주소는 site.config.ts 의 hero.primaryCta / secondaryCta / thirdCta / fourthCta 의 href 입니다.
   - 21st.dev 의 멋진 히어로로 바꾸고 싶다면: 그 컴포넌트를 components/ui 에 넣고,
     이 파일의 <section> 안쪽을 그 컴포넌트로 감싸면 됩니다. (Claude에게 /add-component 로 요청) */

/* 설명 문장.
   - "1. ..." 처럼 숫자로 시작하는 줄이 있으면 → 흰 메모 카드 안에 번호 목록으로 보여줌
     (목록 앞의 줄은 카드 제목. 예: "지켜야 할 약속")
   - 아니면 → 관리자에서 Enter 로 바꾼 줄을 그대로 살린 문단 */
const NUMBERED_LINE = /^(\d+)[.)]\s*(.*)$/;

function HeroDescription({ text }: { text: string }) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstNumbered = lines.findIndex((line) => NUMBERED_LINE.test(line));

  if (firstNumbered === -1) {
    return (
      <p className="mt-6 max-w-xl whitespace-pre-line text-lg font-medium leading-relaxed">{text}</p>
    );
  }

  const items = lines.slice(firstNumbered).map((line) => {
    const match = line.match(NUMBERED_LINE);
    return match ? { number: match[1], text: match[2] } : { number: "•", text: line };
  });

  return <HeroPromises heading={lines.slice(0, firstNumbered).join(" ")} items={items} />;
}

/* 버튼: 마우스를 올리면 색이 바뀌고 글자(+아이콘)가 커짐 */
const ctaLabelClass =
  "inline-flex items-center gap-2 transition-transform duration-200 motion-safe:group-hover:scale-115";
const ctaClass = "group transition-colors duration-200";

export async function Hero() {
  const { hero } = siteConfig;
  const text = await getHeroText();

  const ctas = [
    {
      href: hero.primaryCta.href,
      label: text.primaryLabel,
      Icon: Megaphone, // 공지사항
      variant: "default" as const,
      hover: "hover:bg-yellow hover:text-foreground",
    },
    {
      href: hero.secondaryCta.href,
      label: text.secondaryLabel,
      Icon: FolderOpen, // 자료실
      variant: "outline" as const,
      hover: "hover:bg-secondary hover:text-secondary-foreground",
    },
    {
      href: hero.thirdCta.href,
      label: text.thirdLabel,
      Icon: BookOpen, // 공부방
      variant: "accent" as const,
      hover: "hover:bg-teal hover:text-foreground",
    },
    {
      href: hero.fourthCta.href,
      label: text.fourthLabel,
      Icon: MessagesSquare, // 토론방
      variant: "outline" as const,
      hover: "bg-teal hover:bg-primary hover:text-primary-foreground",
    },
  ];

  return (
    <section id="top" className="relative overflow-hidden py-16 sm:py-24">
      <Container>
        <Window
          title={siteConfig.name}
          className="bg-orange"
          bodyClassName="relative isolate flex min-h-[60svh] flex-col justify-center px-6 py-14 sm:px-12"
        >
          {/* 배경: 반 친구들 일러스트를 흑백 + 흐리게, 왼쪽(글자 쪽)은 카드 색으로 한 번 더 덮어 글자가 잘 보이게 */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <ClassIllustration cover className="size-full opacity-30 blur-[1.5px] grayscale" />
            <div className="absolute inset-0 bg-linear-to-r from-orange via-orange/80 to-orange/10" />
          </div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em]">
            <OctagonAlert className="size-6 fill-yellow text-foreground" aria-hidden />
            {text.eyebrow}
          </p>
          <h1 className="retro-title mt-5 max-w-4xl whitespace-pre-line text-5xl leading-[1.1] sm:text-7xl lg:text-8xl">
            <span>{text.title}</span>
          </h1>
          <HeroDescription text={text.description} />
          <div className="mt-10 flex flex-wrap gap-4">
            {ctas.map(({ href, label, Icon, variant, hover }, i) => (
              <Button key={i} asChild size="lg" variant={variant} className={cn(ctaClass, hover)}>
                <a href={href}>
                  <span className={ctaLabelClass}>
                    <Icon aria-hidden />
                    {label}
                  </span>
                </a>
              </Button>
            ))}
          </div>
        </Window>
      </Container>
    </section>
  );
}
