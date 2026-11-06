import "server-only";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";

import { getAdminClient } from "@/lib/supabase-admin";
import type { MemberStatus, SessionMember } from "@/lib/types";

/* 회원 로그인 (학번 + 비밀번호)
   - 비밀번호는 scrypt 로 되돌릴 수 없게 바꿔서(해시) members.password_hash 에 저장
   - 로그인하면 7일 동안 유지되는 쿠키에 "회원 번호 + 만료 시각 + 서명"을 저장
     (서명 열쇠는 .env.local 의 Supabase 비밀 키에서 만들어서, 쿠키를 위조할 수 없음) */

const COOKIE_NAME = "member_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

/* ---------- 비밀번호 ---------- */

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [kind, saltHex, hashHex] = stored.split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

/* ---------- 로그인 쿠키 ---------- */

function signingKey() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return secret ? createHash("sha256").update(`member-session:${secret}`).digest() : null;
}

function sign(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export async function startMemberSession(memberId: string) {
  const key = signingKey();
  if (!key) return;
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${memberId}.${expires}`;
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${sign(payload, key)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endMemberSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** 쿠키가 진짜인지 확인하고 회원 번호를 돌려줌 (가짜·만료면 null) */
async function sessionMemberId() {
  const key = signingKey();
  if (!key) return null;
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return null;

  const [id, expires, signature] = value.split(".");
  if (!id || !expires || !signature) return null;
  if (Number(expires) < Date.now() / 1000) return null;

  const expected = Buffer.from(sign(`${id}.${expires}`, key));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return id;
}

/** 지금 로그인한 회원 (이름·상태만). 로그인 안 했으면 null */
export async function getCurrentMember(): Promise<SessionMember | null> {
  const id = await sessionMemberId();
  if (!id) return null;
  const supabase = getAdminClient();
  if (!supabase) return null;

  const { data } = await supabase.from("members").select("id, name, status").eq("id", id).maybeSingle();
  if (!data) return null;
  return { id: data.id as string, name: data.name as string, status: data.status as MemberStatus };
}
