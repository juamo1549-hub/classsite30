import { siteConfig } from "@/site.config";
import { isAdmin } from "@/lib/admin-auth";
import { getSeatingView } from "@/lib/seating";
import { Container } from "@/components/layout/container";
import { StandalonePage } from "@/components/layout/standalone-page";
import { Avatar, Window } from "@/components/ui/window";
import { SeatingShuffle } from "@/components/sections/seating-shuffle";
import { cn } from "@/lib/utils";

/* 자리배치도 페이지 (주소: /seating) — 사이드바 '우리반' 아래 '자리배치도'
   - 위쪽이 교탁(칠판), 그 아래로 책상이 rows 줄 × cols 개
   - 오른쪽 위 [랜덤 자리 바꾸기]: 관리자(선생님)만 보임
   - 줄·칸 수와 글자: site.config.ts 의 seating */

export const metadata = { title: `${siteConfig.seating.title} | ${siteConfig.name}` };
export const dynamic = "force-dynamic";

const DESK_COLORS = ["bg-yellow", "bg-teal", "bg-card", "bg-orange"];

export default async function SeatingPage() {
  const t = siteConfig.seating;
  const [view, admin] = await Promise.all([getSeatingView(), isAdmin()]);
  const arranged = view.seats.some(Boolean);

  return (
    <StandalonePage title={t.title}>
      <section className="pb-16 sm:pb-24">
        <Container>
          <Window title={t.label} bodyClassName="p-4 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                {view.updatedAt ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(view.updatedAt).toLocaleString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Seoul",
                    })}{" "}
                    자리 바꿈
                  </p>
                ) : null}
              </div>
              {admin ? <SeatingShuffle /> : null}
            </div>

            {/* 교탁 */}
            <div className="mx-auto mt-8 w-40 rounded-lg border-2 bg-secondary py-2 text-center text-sm font-extrabold text-secondary-foreground shadow-hard-sm">
              {t.deskLabel}
            </div>

            {!arranged ? (
              <p className="mt-6 text-center text-sm font-bold text-muted-foreground">{t.notArrangedText}</p>
            ) : null}

            {/* 책상 (좁은 화면에서는 옆으로 밀어서 봄) */}
            <div className="mt-8 overflow-x-auto pb-2">
              <div
                className="mx-auto grid min-w-[36rem] gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${view.cols}, minmax(0, 1fr))` }}
              >
                {view.seats.map((seat, i) => {
                  const row = Math.floor(i / view.cols);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-2 text-center shadow-hard-sm",
                        seat ? DESK_COLORS[(row + i) % DESK_COLORS.length] : "border-dashed bg-muted/40 shadow-none"
                      )}
                    >
                      {seat ? (
                        <>
                          <Avatar name={seat.name} src={seat.photoUrl} className="size-10 bg-card" />
                          <span className="w-full truncate text-sm font-extrabold">{seat.name}</span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">{t.emptySeatLabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {admin && view.unseatedCount > 0 ? (
              <p className="mt-4 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-bold">
                {view.unseatedCount}
                {t.unseatedText}
              </p>
            ) : null}
          </Window>
        </Container>
      </section>
    </StandalonePage>
  );
}
