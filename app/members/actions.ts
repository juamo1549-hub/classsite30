"use server";

/* 회원가입 · 로그인 · 로그아웃 (서버에서 실행)
   - 회원 정보와 프로필 사진은 관리자만 볼 수 있는 곳에 저장 (members 표, profiles 잠긴 저장 공간)
   - 가입하면 '승인 대기' → 관리자 페이지 '회원' 탭에서 승인하면 갤러리에 바로 글을 쓸 수 있음 */

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { siteConfig } from "@/site.config";
import { getAdminClient } from "@/lib/supabase-admin";
import { endMemberSession, hashPassword, startMemberSession, verifyPassword } from "@/lib/member-auth";

export type MemberActionState = { ok?: boolean; message?: string };

const PROFILE_BUCKET = "profiles";
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4MB (인터넷에 올린 뒤 Vercel 한도 4.5MB 안쪽)

/** "010 1234 5678", "01012345678" → "010-1234-5678" (휴대폰 번호가 아니면 null) */
function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!/^01\d{8,9}$/.test(digits)) return null;
  return digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

/* ---------- 회원가입 ---------- */

export async function signup(_prev: MemberActionState, formData: FormData): Promise<MemberActionState> {
  const supabase = getAdminClient();
  if (!supabase) return { message: "지금은 가입할 수 없어요. (Supabase 연결 필요)" };

  const name = text(formData, "name").slice(0, 30);
  const birthDate = text(formData, "birth_date");
  const studentNo = text(formData, "student_no");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const phoneRaw = text(formData, "phone");
  const motherRaw = text(formData, "mother_phone");
  const fatherRaw = text(formData, "father_phone");
  const zonecode = text(formData, "zonecode");
  const address = text(formData, "address").slice(0, 200);
  const addressDetail = text(formData, "address_detail").slice(0, 100);
  const email = text(formData, "email").slice(0, 120);
  const photo = formData.get("photo");
  const agreed = formData.get("privacy_agree") === "on";

  // 필수 항목 확인
  if (!name) return { message: "이름을 적어 주세요." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(Date.parse(birthDate)) || Date.parse(birthDate) > Date.now()) {
    return { message: "생년월일을 바르게 골라 주세요." };
  }
  if (!/^[0-9A-Za-z-]{1,20}$/.test(studentNo)) return { message: "학번은 숫자·영문으로 20자 이내로 적어 주세요." };
  if (password.length < 6 || password.length > 72) return { message: "비밀번호는 6자 이상으로 정해 주세요." };
  if (password !== passwordConfirm) return { message: "비밀번호 확인이 서로 달라요." };

  const phone = normalizePhone(phoneRaw);
  if (!phone) return { message: "핸드폰 번호를 바르게 적어 주세요. (예: 010-1234-5678)" };
  const motherPhone = motherRaw ? normalizePhone(motherRaw) : null;
  const fatherPhone = fatherRaw ? normalizePhone(fatherRaw) : null;
  if (motherRaw && !motherPhone) return { message: "어머니 번호를 바르게 적어 주세요." };
  if (fatherRaw && !fatherPhone) return { message: "아버지 번호를 바르게 적어 주세요." };
  if (!motherPhone && !fatherPhone) return { message: "보호자 번호를 어머니·아버지 중 하나 이상 적어 주세요." };

  if (!/^\d{5}$/.test(zonecode) || !address) return { message: "[주소 검색]으로 집 주소를 찾아 주세요." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "이메일 주소를 바르게 적어 주세요." };

  if (!(photo instanceof File) || photo.size === 0) return { message: "프로필 사진을 골라 주세요." };
  if (!photo.type.startsWith("image/")) return { message: "프로필 사진은 이미지 파일만 올릴 수 있어요." };
  if (photo.size > MAX_PHOTO_BYTES) return { message: "프로필 사진은 4MB 이하만 올릴 수 있어요." };

  if (!agreed) return { message: "개인정보 수집·이용에 동의해 주세요." };

  // 같은 학번이 이미 있는지
  const { data: existing } = await supabase.from("members").select("id").eq("student_no", studentNo).maybeSingle();
  if (existing) return { message: "이미 가입한 학번이에요. 로그인해 주세요." };

  // 프로필 사진 → 잠긴 저장 공간
  const id = randomUUID();
  const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
  const photoPath = `${id}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(photoPath, photo, { contentType: photo.type, upsert: false });
  if (uploadError) {
    return { message: `프로필 사진 올리기 실패: ${uploadError.message} (supabase/schema.sql 을 다시 실행했는지 확인하세요)` };
  }

  const { error } = await supabase.from("members").insert({
    id,
    name,
    birth_date: birthDate,
    student_no: studentNo,
    password_hash: await hashPassword(password),
    phone,
    mother_phone: motherPhone,
    father_phone: fatherPhone,
    zonecode,
    address,
    address_detail: addressDetail || null,
    email: email || null,
    photo_path: photoPath,
    status: "pending",
  });
  if (error) {
    await supabase.storage.from(PROFILE_BUCKET).remove([photoPath]);
    return { message: `가입 실패: ${error.message} (supabase/schema.sql 을 다시 실행했는지 확인하세요)` };
  }

  await startMemberSession(id);
  revalidatePath("/admin");
  return { ok: true, message: siteConfig.members.signupDoneText };
}

/* ---------- 로그인 / 로그아웃 ---------- */

export async function login(_prev: MemberActionState, formData: FormData): Promise<MemberActionState> {
  const supabase = getAdminClient();
  if (!supabase) return { message: "지금은 로그인할 수 없어요. (Supabase 연결 필요)" };

  const studentNo = text(formData, "student_no");
  const password = String(formData.get("password") ?? "");
  if (!studentNo || !password) return { message: "학번과 비밀번호를 적어 주세요." };

  const { data } = await supabase
    .from("members")
    .select("id, password_hash, status")
    .eq("student_no", studentNo)
    .maybeSingle();

  const wrong = { message: "학번 또는 비밀번호가 맞지 않아요." };
  if (!data) return wrong;
  if (!(await verifyPassword(password, data.password_hash as string))) return wrong;
  if (data.status === "rejected") return { message: "가입이 승인되지 않았어요. 선생님께 문의해 주세요." };

  await startMemberSession(data.id as string);
  return { ok: true };
}

export async function logout() {
  await endMemberSession();
}
