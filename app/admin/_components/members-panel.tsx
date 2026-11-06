import Image from "next/image";
import { CalendarCheck, CalendarX, Check, Megaphone, MegaphoneOff, RotateCcw, X } from "lucide-react";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Member, MemberStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { setMemberStatus, setNoticeAccess, setScheduleAccess } from "../actions";

/* 관리자 페이지 '회원' 탭
   - 가입한 사람 목록 (승인 대기 → 승인 → 거절 순)
   - 누르면 가입 때 적은 내용 전체 + 프로필 사진 + 그 회원이 쓴 글 목록
   - [승인] [거절] [대기로 되돌리기] 버튼, 승인된 회원은 [일정 권한 주기/빼기] [공지 권한 주기/빼기]
   프로필 사진은 잠긴 저장 공간에 있어서, 이 화면을 열 때마다 1시간짜리 임시 주소를 만들어 보여줌 */

const PROFILE_BUCKET = "profiles";

const STATUS_LABEL: Record<MemberStatus, { text: string; className: string }> = {
  pending: { text: "승인 대기", className: "bg-yellow" },
  approved: { text: "승인됨", className: "bg-teal" },
  rejected: { text: "거절", className: "bg-muted" },
};
const STATUS_ORDER: MemberStatus[] = ["pending", "approved", "rejected"];

type MemberPost = { id: string; title: string; created_at: string; is_visible: boolean; member_id: string };

const formatDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Seoul",
  });

function StatusButton({ id, status, label, Icon, variant }: {
  id: string;
  status: MemberStatus;
  label: string;
  Icon: typeof Check;
  variant: "accent" | "outline" | "default";
}) {
  return (
    <form action={setMemberStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>
        <Icon aria-hidden />
        {label}
      </Button>
    </form>
  );
}

export async function MembersPanel({ supabase }: { supabase: SupabaseClient }) {
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, birth_date, student_no, phone, mother_phone, father_phone, zonecode, address, address_detail, email, photo_path, status, privacy_agreed_at, created_at, can_edit_schedule, can_write_notice"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="mt-8 rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
        회원 목록을 불러오지 못했습니다: {error.message}
        <br />
        supabase/schema.sql 을 Supabase SQL Editor 에서 다시 실행했는지 확인하세요.
      </p>
    );
  }

  const members = ((data ?? []) as Member[]).sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  // 프로필 사진 임시 주소 (1시간)
  const photoUrls = new Map<string, string>();
  if (members.length > 0) {
    const { data: signed } = await supabase.storage
      .from(PROFILE_BUCKET)
      .createSignedUrls(members.map((m) => m.photo_path), 60 * 60);
    for (const s of signed ?? []) if (s.path && s.signedUrl) photoUrls.set(s.path, s.signedUrl);
  }

  // 회원이 쓴 글
  const postsByMember = new Map<string, MemberPost[]>();
  if (members.length > 0) {
    const { data: posts } = await supabase
      .from("items")
      .select("id, title, created_at, is_visible, member_id")
      .in("member_id", members.map((m) => m.id))
      .order("created_at", { ascending: false });
    for (const p of (posts ?? []) as MemberPost[]) {
      postsByMember.set(p.member_id, [...(postsByMember.get(p.member_id) ?? []), p]);
    }
  }

  const counts = STATUS_ORDER.map((s) => ({ ...STATUS_LABEL[s], count: members.filter((m) => m.status === s).length }));

  return (
    <section className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">
          회원 <span className="text-muted-foreground">({members.length})</span>
        </h2>
        {counts.map((c) => (
          <span key={c.text} className={`rounded-full border-2 px-3 py-0.5 text-xs font-bold ${c.className}`}>
            {c.text} {c.count}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        승인된 회원은 갤러리에 글을 쓰면 관리자 승인 없이 바로 올라가요. 이름과 프로필 사진은 그 회원이 쓴 글에
        작게 보이고, 나머지 회원 정보는 관리자만 볼 수 있어요.
      </p>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 가입한 사람이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {members.map((m) => {
            const photo = photoUrls.get(m.photo_path);
            const posts = postsByMember.get(m.id) ?? [];
            const badge = STATUS_LABEL[m.status];
            const fields: [string, string][] = [
              ["이름", m.name],
              ["생년월일", formatDate(m.birth_date)],
              ["학번", m.student_no],
              ["핸드폰", m.phone],
              ["보호자(어머니)", m.mother_phone ?? "-"],
              ["보호자(아버지)", m.father_phone ?? "-"],
              ["주소", `(${m.zonecode}) ${m.address}${m.address_detail ? ` ${m.address_detail}` : ""}`],
              ["이메일", m.email ?? "-"],
              ["가입 신청", formatDate(m.created_at, true)],
              ["개인정보 동의", formatDate(m.privacy_agreed_at, true)],
            ];

            return (
              <li key={m.id} className="rounded-xl border">
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-full border-2 bg-muted">
                    {photo ? <Image src={photo} alt="" fill unoptimized className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      <span>{m.name}</span>
                      <span className={`rounded-full border-2 px-2 py-0.5 text-xs font-bold ${badge.className}`}>
                        {badge.text}
                      </span>
                      {m.can_edit_schedule ? (
                        <span className="rounded-full border-2 bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                          일정 권한
                        </span>
                      ) : null}
                      {m.can_write_notice ? (
                        <span className="rounded-full border-2 bg-orange px-2 py-0.5 text-xs font-bold">공지 권한</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      학번 {m.student_no} · 글 {posts.length}개 · {formatDate(m.created_at)} 신청
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.status !== "approved" ? (
                      <StatusButton id={m.id} status="approved" label="승인" Icon={Check} variant="accent" />
                    ) : null}
                    {m.status === "pending" ? (
                      <StatusButton id={m.id} status="rejected" label="거절" Icon={X} variant="outline" />
                    ) : null}
                    {m.status !== "pending" ? (
                      <StatusButton id={m.id} status="pending" label="대기로" Icon={RotateCcw} variant="outline" />
                    ) : null}
                    {m.status === "approved" ? (
                      <form action={setScheduleAccess}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="allow" value={m.can_edit_schedule ? "0" : "1"} />
                        <Button type="submit" size="sm" variant={m.can_edit_schedule ? "outline" : "secondary"}>
                          {m.can_edit_schedule ? <CalendarX aria-hidden /> : <CalendarCheck aria-hidden />}
                          {m.can_edit_schedule ? "일정 권한 빼기" : "일정 권한 주기"}
                        </Button>
                      </form>
                    ) : null}
                    {m.status === "approved" ? (
                      <form action={setNoticeAccess}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="allow" value={m.can_write_notice ? "0" : "1"} />
                        <Button type="submit" size="sm" variant={m.can_write_notice ? "outline" : "secondary"}>
                          {m.can_write_notice ? <MegaphoneOff aria-hidden /> : <Megaphone aria-hidden />}
                          {m.can_write_notice ? "공지 권한 빼기" : "공지 권한 주기"}
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>

                <details className="border-t px-4 py-3">
                  <summary className="cursor-pointer text-sm text-muted-foreground">가입 내용 · 쓴 글 보기</summary>
                  <div className="grid gap-6 pt-4 md:grid-cols-[10rem_1fr]">
                    <div className="relative aspect-square w-40 overflow-hidden rounded-xl border-2 bg-muted">
                      {photo ? (
                        <Image src={photo} alt={`${m.name} 프로필 사진`} fill unoptimized className="object-cover" />
                      ) : null}
                    </div>
                    <div className="space-y-5">
                      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
                        {fields.map(([label, value]) => (
                          <div key={label} className="contents">
                            <dt className="font-bold text-muted-foreground">{label}</dt>
                            <dd className="break-all">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div>
                        <p className="mb-2 text-sm font-bold">쓴 글 ({posts.length})</p>
                        {posts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">아직 쓴 글이 없어요.</p>
                        ) : (
                          <ul className="divide-y rounded-lg border text-sm">
                            {posts.map((p) => (
                              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2">
                                <a
                                  href={`/gallery/${p.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate font-medium hover:underline"
                                >
                                  {p.title}
                                </a>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {p.is_visible ? "" : "숨김 · "}
                                  {formatDate(p.created_at, true)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
