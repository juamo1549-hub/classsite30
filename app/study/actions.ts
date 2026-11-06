"use server";

/* 자료실 쓰기 (서버에서 실행) — 공부방 > 자료실 (/study/materials)
   - 가입이 승인된 회원이라면 누구나 쓸 수 있음 (관리자도 가능)
   - 첨부 파일은 공개 저장 공간(images)의 materials/ 폴더로 — 자료실을 보는 누구나 내려받을 수 있음
   - 실제 저장은 lib/board.ts (공지사항과 같은 방식) */

import { revalidatePath } from "next/cache";

import { siteConfig } from "@/site.config";
import { getMaterialsWriter, MATERIALS_SECTION } from "@/lib/materials";
import { createBoardItem, prepareBoardUpload, type BoardFileInput, type BoardResult, type BoardTicket } from "@/lib/board";

const FOLDER = "materials";

/** 첨부 파일 하나를 올릴 1회용 주소 받기 */
export async function prepareMaterialUpload(file: { name: string; size: number }): Promise<BoardTicket> {
  const w = await getMaterialsWriter();
  if (!w.allowed) return { ok: false, message: w.message };
  return prepareBoardUpload(FOLDER, file);
}

/** 자료 올리기 (바로 자료실에 보임) */
export async function createMaterial(input: { title: string; content: string; files: BoardFileInput[] }): Promise<BoardResult> {
  const w = await getMaterialsWriter();
  if (!w.allowed) return { ok: false, message: w.message };

  const result = await createBoardItem({ section: MATERIALS_SECTION, folder: FOLDER, author: w.name, memberId: w.memberId, input });
  if (!result.ok) return result;

  revalidatePath("/study/materials");
  revalidatePath("/admin");
  return { ok: true, message: siteConfig.materials.doneText };
}
