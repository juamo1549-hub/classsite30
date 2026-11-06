"use server";

/* 공지사항 쓰기 (서버에서 실행)
   - 관리자(로그인) 또는 관리자에게 '공지 권한'을 받은 승인 회원만
   - 첨부 파일은 공개 저장 공간(images)의 notices/ 폴더로 — 공지사항을 보는 누구나 내려받을 수 있음
   - 실제 저장은 lib/board.ts (자료실과 같은 방식) */

import { revalidatePath } from "next/cache";

import { getCurrentMember } from "@/lib/member-auth";
import { getNoticeWriter, NOTICE_SECTION } from "@/lib/notices";
import { createBoardItem, prepareBoardUpload, type BoardFileInput, type BoardResult, type BoardTicket } from "@/lib/board";

const FOLDER = "notices";
const NO_PERMISSION = "공지사항은 관리자와 공지 권한을 받은 회원만 쓸 수 있어요.";

async function writer() {
  return getNoticeWriter(await getCurrentMember());
}

/** 첨부 파일 하나를 올릴 1회용 주소 받기 */
export async function prepareNoticeUpload(file: { name: string; size: number }): Promise<BoardTicket> {
  if (!(await writer()).allowed) return { ok: false, message: NO_PERMISSION };
  return prepareBoardUpload(FOLDER, file);
}

/** 공지사항 올리기 (바로 사이트에 보임) */
export async function createNotice(input: { title: string; content: string; files: BoardFileInput[] }): Promise<BoardResult> {
  const w = await writer();
  if (!w.allowed) return { ok: false, message: NO_PERMISSION };

  const result = await createBoardItem({ section: NOTICE_SECTION, folder: FOLDER, author: w.name, memberId: w.memberId, input });
  if (!result.ok) return result;

  revalidatePath("/");
  revalidatePath("/notice");
  revalidatePath("/admin");
  return { ok: true, message: "공지사항을 올렸어요." };
}
