"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, MapPin, UserPlus, UserRound, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import {
  login,
  logout,
  signup,
  type MemberActionState,
} from "@/app/members/actions";
import type { SessionMember } from "@/lib/types";
import { Avatar } from "@/components/ui/window";
import { Button } from "@/components/ui/button";
import { Popup } from "@/components/ui/popup";
import { cn } from "@/lib/utils";

/* 상단 메뉴의 [로그인] [회원가입] 버튼과 각 창.
   - 로그인하면 "이름님 · 로그아웃" 으로 바뀜 (승인 전이면 '승인 대기' 표시)
   - 회원가입 창의 집 주소는 [주소 검색] → 카카오(다음) 우편번호 서비스로 도로명 주소를 찾음
   - 글자는 site.config.ts 의 members 에서 바꿉니다. */

const t = siteConfig.members;

const inputClass =
  "h-11 w-full rounded-xl border-2 bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 read-only:bg-muted";

/* ---------- 도로명 주소 검색 (카카오 우편번호 서비스, 무료·키 필요 없음) ----------
   팝업 창은 브라우저가 막는 경우가 많아서, 회원가입 창 '안에' 검색 화면을 바로 띄움 (embed) */

type PostcodeResult = {
  zonecode: string;
  roadAddress: string;
  address: string;
};
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeResult) => void;
        width?: string;
        height?: string;
      }) => { open: () => void; embed: (element: HTMLElement, options?: { autoClose?: boolean }) => void };
    };
  }
}
const POSTCODE_SCRIPT =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

/** 주소 검색 스크립트를 미리 불러둠 (버튼을 누르는 순간 바로 검색 화면이 뜨도록) */
function loadPostcodeScript() {
  if (typeof window === "undefined" || window.daum?.Postcode) return;
  if (document.querySelector(`script[src="${POSTCODE_SCRIPT}"]`)) return;
  const script = document.createElement("script");
  script.src = POSTCODE_SCRIPT;
  script.async = true;
  document.head.appendChild(script);
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-bold">
        {label}
        {required ? <span className="text-orange"> *</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

function Message({ state }: { state: MemberActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={cn("text-sm font-bold", !state.ok && "text-destructive")}
    >
      {state.message}
    </p>
  );
}

/* ---------- 로그인 창 내용 ---------- */

function LoginForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    login,
    {},
  );
  const handled = useRef<MemberActionState | null>(null);

  // 로그인 성공 → 창 닫고 화면 새로고침 (같은 결과로 두 번 하지 않게)
  useEffect(() => {
    if (state.ok && handled.current !== state) {
      handled.current = state;
      onDone();
      router.refresh();
    }
  }, [state, onDone, router]);

  return (
    <form action={action} className="grid gap-4">
      <Field label="학번" required>
        <input
          name="student_no"
          required
          autoComplete="username"
          className={inputClass}
        />
      </Field>
      <Field label="비밀번호" required>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          <LogIn aria-hidden />
          {pending ? "확인 중..." : t.loginLabel}
        </Button>
        <Message state={state} />
      </div>
    </form>
  );
}

/* ---------- 회원가입 창 내용 ---------- */

function SignupForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    signup,
    {},
  );
  const [zonecode, setZonecode] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    loadPostcodeScript();
  }, []);

  // [주소 검색]을 누르면 → 아래 상자 안에 카카오 주소 검색 화면을 띄움 (스크립트가 아직이면 잠깐 기다림)
  useEffect(() => {
    if (!searching) return;
    let tries = 0;
    const timer = setInterval(() => {
      const box = searchBoxRef.current;
      if (window.daum?.Postcode && box) {
        clearInterval(timer);
        box.innerHTML = "";
        new window.daum.Postcode({
          width: "100%",
          height: "100%",
          oncomplete: (data) => {
            setZonecode(data.zonecode);
            setAddress(data.roadAddress || data.address);
            setSearching(false);
            setTimeout(() => detailRef.current?.focus(), 0);
          },
        }).embed(box, { autoClose: false });
      } else if (++tries > 50) {
        clearInterval(timer);
        setSearching(false);
        setSearchError("주소 검색을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.");
      } else {
        loadPostcodeScript();
      }
    }, 200);
    return () => clearInterval(timer);
  }, [searching]);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  function searchAddress() {
    setSearchError("");
    setSearching(true);
  }

  if (state.ok) {
    return (
      <p className="rounded-xl border-2 bg-yellow/40 p-5 font-bold">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      {/* 프로필 사진 */}
      <Field
        label="프로필 사진"
        required
        hint={t.photoHint}
      >
        <div className="flex items-center gap-4">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 bg-muted">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 내 기기 파일 미리보기라 next/image 를 쓸 수 없음
              <img
                src={photoUrl}
                alt="프로필 사진 미리보기"
                className="size-full object-cover"
              />
            ) : null}
          </span>
          <input
            name="photo"
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (photoUrl) URL.revokeObjectURL(photoUrl);
              setPhotoUrl(f ? URL.createObjectURL(f) : null);
            }}
            className="min-w-0 text-sm file:mr-3 file:rounded-full file:border-2 file:border-border file:bg-yellow file:px-4 file:py-1.5 file:font-bold"
          />
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="이름" required>
          <input
            name="name"
            required
            maxLength={30}
            autoComplete="name"
            className={inputClass}
          />
        </Field>
        <Field label="생년월일" required>
          <input
            name="birth_date"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>
        <Field label="학번" required hint="로그인할 때 아이디로 써요.">
          <input
            name="student_no"
            required
            maxLength={20}
            pattern="[0-9A-Za-z\-]+"
            autoComplete="username"
            className={inputClass}
          />
        </Field>
        <Field label="핸드폰 번호" required>
          <input
            name="phone"
            type="tel"
            required
            placeholder="010-1234-5678"
            autoComplete="tel"
            className={inputClass}
          />
        </Field>
        <Field label="비밀번호" required hint="6자 이상">
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>
        <Field label="비밀번호 확인" required>
          <input
            name="password_confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>
      </div>

      {/* 보호자 번호: 둘 중 하나 이상 */}
      <fieldset className="grid gap-3 rounded-xl border-2 border-dashed p-4">
        <legend className="px-1 text-sm font-bold">
          보호자 핸드폰 번호<span className="text-orange"> *</span>{" "}
          <span className="font-medium text-muted-foreground">
            (둘 중 하나만 적어도 돼요)
          </span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="어머니">
            <input
              name="mother_phone"
              type="tel"
              placeholder="010-0000-0000"
              className={inputClass}
            />
          </Field>
          <Field label="아버지">
            <input
              name="father_phone"
              type="tel"
              placeholder="010-0000-0000"
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      {/* 집 주소 (도로명 주소 검색) */}
      <fieldset className="grid gap-3">
        <legend className="mb-1.5 text-sm font-bold">
          집 주소<span className="text-orange"> *</span>
        </legend>
        <div className="flex gap-2">
          <input
            name="zonecode"
            value={zonecode}
            readOnly
            required
            placeholder="우편번호"
            aria-label="우편번호"
            className={cn(inputClass, "w-32")}
          />
          <Button type="button" variant="accent" onClick={searchAddress}>
            <MapPin aria-hidden />
            {t.addressSearchLabel}
          </Button>
        </div>
        <input
          name="address"
          value={address}
          readOnly
          required
          placeholder="[주소 검색]을 누르면 도로명 주소가 채워져요"
          aria-label="도로명 주소"
          onClick={() => !address && searchAddress()}
          className={inputClass}
        />
        {searching ? (
          <div className="overflow-hidden rounded-xl border-2">
            <div className="flex items-center justify-between border-b-2 bg-muted px-3 py-2 text-sm font-bold">
              <span>도로명이나 건물 이름으로 찾아보세요 (예: 세종대로 110)</span>
              <button
                type="button"
                onClick={() => setSearching(false)}
                aria-label="주소 검색 닫기"
                className="inline-flex size-7 items-center justify-center rounded-full border-2 bg-card hover:bg-yellow"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
            <div ref={searchBoxRef} className="h-[28rem] bg-card" />
          </div>
        ) : null}
        {searchError ? <p className="text-sm font-bold text-destructive">{searchError}</p> : null}
        <input
          ref={detailRef}
          name="address_detail"
          maxLength={100}
          placeholder="상세 주소 (동·호수)"
          aria-label="상세 주소"
          className={inputClass}
        />
      </fieldset>

      <Field label="이메일 주소">
        <input
          name="email"
          type="email"
          maxLength={120}
          autoComplete="email"
          className={inputClass}
        />
      </Field>

      {/* 개인정보 수집·이용 동의 */}
      <div className="grid gap-2 rounded-xl border-2 bg-muted/60 p-4 text-sm">
        <p className="font-extrabold">{t.privacy.title}</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {t.privacy.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <label className="mt-1 flex items-start gap-2 font-bold">
          <input
            name="privacy_agree"
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0"
          />
          {t.privacy.agreeLabel}
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          <UserPlus aria-hidden />
          {pending ? "보내는 중..." : `${t.signupLabel} 신청`}
        </Button>
        <Message state={state} />
      </div>
    </form>
  );
}

/* ---------- 상단 메뉴에 들어가는 버튼들 ---------- */

export function MemberMenu({ member }: { member: SessionMember | null }) {
  const router = useRouter();
  const loginRef = useRef<HTMLDialogElement>(null);
  const signupRef = useRef<HTMLDialogElement>(null);
  // 창을 열 때마다 입력 칸을 새로 시작하도록 번호를 바꿔 줌
  const [signupKey, setSignupKey] = useState(0);

  if (member) {
    return (
      <div className="flex items-center gap-2">
        {/* 이름을 누르면 마이페이지 (선생님께 보낸 글 · 선생님 답글) */}
        <Link href="/mypage" className="flex items-center gap-2 hover:underline">
          <Avatar name={member.name} className="bg-teal" />
          <span className="hidden text-sm font-bold sm:inline">
            {member.name}님
          </span>
        </Link>
        {member.status === "pending" ? (
          <span className="rounded-full border-2 bg-yellow px-2 py-0.5 text-xs font-bold">
            {t.pendingBadge}
          </span>
        ) : null}
        <Button asChild size="sm" variant="accent" aria-label={siteConfig.myPage.label}>
          <Link href="/mypage">
            <UserRound aria-hidden />
            <span className="hidden sm:inline">{siteConfig.myPage.label}</span>
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={t.logoutLabel}
          onClick={async () => {
            await logout();
            router.refresh();
          }}
        >
          <LogOut aria-hidden />
          <span className="hidden sm:inline">{t.logoutLabel}</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={t.loginLabel}
          onClick={() => loginRef.current?.showModal()}
        >
          <LogIn aria-hidden />
          <span className="hidden sm:inline">{t.loginLabel}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          aria-label={t.signupLabel}
          onClick={() => {
            setSignupKey((k) => k + 1);
            signupRef.current?.showModal();
          }}
        >
          <UserPlus aria-hidden />
          <span className="hidden sm:inline">{t.signupLabel}</span>
        </Button>
      </div>

      <Popup
        dialogRef={loginRef}
        title={t.loginTitle}
        closeLabel={t.closeLabel}
        Icon={LogIn}
        className="w-[min(26rem,calc(100%-2rem))]"
      >
        <LoginForm onDone={() => loginRef.current?.close()} />
      </Popup>

      <Popup
        dialogRef={signupRef}
        title={t.signupTitle}
        closeLabel={t.closeLabel}
        Icon={UserPlus}
        fullScreen
      >
        <SignupForm key={signupKey} />
      </Popup>
    </>
  );
}
