import "server-only";

import { siteConfig } from "@/site.config";
import { isAdmin } from "@/lib/admin-auth";
import { getCurrentMember } from "@/lib/member-auth";

/* 자료실 (공부방 > 자료실, /study/materials)
   - items 표의 section = 'materials' 글 (관리자 페이지 '자료실' 탭에서 고치기·숨기기·지우기)
   - 쓰기: 가입이 승인된 회원 누구나 + 관리자 */

export const MATERIALS_SECTION = "materials";

export async function getMaterialsWriter(): Promise<{
  allowed: boolean;
  name: string;
  memberId: string | null;
  message: string;
}> {
  if (await isAdmin()) return { allowed: true, name: "관리자", memberId: null, message: "" };
  const member = await getCurrentMember();
  if (!member) return { allowed: false, name: "", memberId: null, message: siteConfig.materials.loginRequiredText };
  if (member.status !== "approved") return { allowed: false, name: "", memberId: null, message: siteConfig.materials.pendingText };
  return { allowed: true, name: member.name, memberId: member.id, message: "" };
}
