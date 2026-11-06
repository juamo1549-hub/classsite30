import Link from "next/link";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { StandalonePage } from "@/components/layout/standalone-page";
import { Window } from "@/components/ui/window";
import { Button } from "@/components/ui/button";
import { getBoardItems } from "@/lib/board";
import { getMaterialsWriter, MATERIALS_SECTION } from "@/lib/materials";
import { BoardList } from "@/components/sections/board-list";
import { BoardWrite } from "@/components/sections/board-write";
import { createMaterial, prepareMaterialUpload } from "../actions";

/* 공부방의 하위 방 (주소: /study/materials, /study/questions, /study/quiz, /study/assignments)
   - 사이드바에서 '공부방'에 마우스를 올리면 나오는 하위 메뉴에서 열림
   - 방 이름·설명: site.config.ts 의 studyRooms
   - 자료실(materials): 날짜별 글 목록 + 오른쪽 위 글쓰기 (승인된 회원 누구나). 글자: site.config.ts 의 materials
   - 질문방·퀴즈방·과제방: 아직 준비 중 */

export const dynamic = "force-dynamic";

const findRoom = (key: string) => siteConfig.studyRooms.rooms.find((r) => r.key === key);

export async function generateMetadata(props: PageProps<"/study/[room]">) {
  const room = findRoom((await props.params).room);
  return { title: `${room?.label ?? siteConfig.studyRooms.title} | ${siteConfig.name}` };
}

export default async function StudyRoomPage(props: PageProps<"/study/[room]">) {
  const { room: key } = await props.params;
  const room = findRoom(key);
  if (!room) notFound();
  const { studyRooms, materials: m } = siteConfig;
  const isMaterials = room.key === "materials";
  const [items, writer] = isMaterials
    ? await Promise.all([getBoardItems(MATERIALS_SECTION), getMaterialsWriter()])
    : [[], null];

  return (
    <StandalonePage title={room.label}>
      <section className="pb-16 sm:pb-24">
        <Container className="max-w-4xl">
          <Window title={studyRooms.title} bodyClassName="p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{room.label}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
              </div>
              {isMaterials && writer?.allowed ? (
                <BoardWrite
                  prepareUpload={prepareMaterialUpload}
                  submit={createMaterial}
                  labels={{
                    writeLabel: m.writeLabel,
                    writeTitle: m.writeTitle,
                    submitLabel: m.submitLabel,
                    closeLabel: m.closeLabel,
                    fileHint: m.fileHint,
                    titlePlaceholder: "예: 2단원 정리 노트",
                    contentPlaceholder: "어떤 자료인지 간단히 적어 주세요.",
                    againLabel: "자료 하나 더 올리기",
                  }}
                />
              ) : null}
            </div>

            {isMaterials ? (
              <>
                {!writer?.allowed && writer?.message ? (
                  <p className="mt-4 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-bold">{writer.message}</p>
                ) : null}
                <BoardList items={items} emptyText={m.emptyText} attachmentsLabel={m.attachmentsLabel} />
              </>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-5 py-14 text-center">
                <Construction className="size-10" aria-hidden />
                <p className="font-bold">{studyRooms.comingSoonText}</p>
              </div>
            )}

            {/* 다른 방으로 이동 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {studyRooms.rooms.map((r) => (
                <Button key={r.key} asChild size="sm" variant={r.key === room.key ? "default" : "outline"}>
                  <Link href={`/study/${r.key}`}>{r.label}</Link>
                </Button>
              ))}
            </div>
          </Window>
        </Container>
      </section>
    </StandalonePage>
  );
}
