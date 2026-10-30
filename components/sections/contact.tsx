import { Mail } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/ui/window";

/** 연락처 섹션. 이메일과 링크는 site.config.ts 의 contact 에서 바꿉니다. (창 제목줄 = contact.eyebrow) */
export function Contact() {
  const { contact } = siteConfig;

  return (
    <section id="contact" className="scroll-mt-16 py-16 sm:py-24">
      <Container>
        <Window
          title={contact.eyebrow}
          className="bg-yellow"
          bodyClassName="px-6 py-16 text-center sm:px-12"
        >
          <SectionHeader
            title={contact.title}
            description={contact.description}
            className="mx-auto"
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <a href={`mailto:${contact.email}`}>
                <Mail />
                {contact.email}
              </a>
            </Button>
            {contact.links.map((link) => (
              <Button key={link.href} asChild size="lg" variant="outline">
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
        </Window>
      </Container>
    </section>
  );
}
