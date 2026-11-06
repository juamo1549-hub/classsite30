"use server";

/* 자리배치도 랜덤으로 다시 정하기 (관리자만)
   - 승인된 회원을 무작위로 섞어서 앞자리(교탁 쪽)부터 채움, 남는 칸은 빈자리
   - 결과는 저장돼서 모든 학생이 같은 자리배치도를 봄 */

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";

import { siteConfig } from "@/site.config";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase-admin";
import { getApprovedMemberIds, SEATING_KEY } from "@/lib/seating";

export type ShuffleResult = { ok: boolean; message: string };

export async function shuffleSeats(): Promise<ShuffleResult> {
  if (!(await isAdmin())) return { ok: false, message: "자리 바꾸기는 선생님(관리자)만 할 수 있어요." };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false, message: "Supabase가 연결되지 않았어요." };

  const { rows, cols } = siteConfig.seating;
  const total = rows * cols;
  const ids = await getApprovedMemberIds();
  if (ids.length === 0) return { ok: false, message: "아직 승인된 회원이 없어요. 관리자 페이지 '회원' 탭에서 승인해 주세요." };

  // 무작위로 섞기 (피셔-예이츠)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const seats = Array.from({ length: total }, (_, i) => ids[i] ?? null);

  const { error } = await supabase.from("site_texts").upsert(
    {
      key: SEATING_KEY,
      value: JSON.stringify({ rows, cols, seats, updatedAt: new Date().toISOString() }),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) return { ok: false, message: `저장 실패: ${error.message}` };

  revalidatePath("/seating");
  const extra = ids.length > total ? ` (자리가 ${ids.length - total}개 모자라요. site.config.ts 의 seating 칸 수를 늘려 주세요)` : "";
  return { ok: true, message: `새 자리배치를 저장했어요!${extra}` };
}
