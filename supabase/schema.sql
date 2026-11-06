-- ============================================================================
--  Supabase 초기 설정 SQL  (한 번만 실행)
--  사용법: Supabase 대시보드 → 왼쪽 메뉴 SQL Editor → New query
--          → 이 파일 내용을 전부 복사해 붙여넣기 → 오른쪽 아래 Run
--  여러 번 실행해도 문제 없도록 만들어져 있습니다.
-- ============================================================================

-- 1) 카드(항목)를 저장하는 표 만들기
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  section     text not null default 'features',   -- 어느 섹션의 카드인지
  title       text not null,                       -- 제목
  description text,                                -- 설명
  image_url   text,                                -- 이미지 주소
  link_url    text,                                -- 클릭 시 이동할 링크
  sort_order  integer not null default 0,          -- 순서 (작을수록 앞)
  is_visible  boolean not null default true,       -- 사이트에 보이기
  created_at  timestamptz not null default now()
);

create index if not exists items_section_order_idx on public.items (section, sort_order);

-- 2) 보안 규칙(RLS) 켜기
--    - 방문자: '보이기'로 설정된 카드만 읽을 수 있음
--    - 추가/수정/삭제: 규칙을 만들지 않음 → 서버의 비밀 키(SECRET KEY)로만 가능
alter table public.items enable row level security;

drop policy if exists "Anyone can read visible items" on public.items;
create policy "Anyone can read visible items"
  on public.items for select
  to anon, authenticated
  using (is_visible = true);

-- 3) 이미지 저장 공간(버킷) 만들기 — 공개 버킷이라 이미지 주소로 누구나 볼 수 있음
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 4) 예시 카드 3개 (표가 비어 있을 때만 넣음)
insert into public.items (section, title, description, sort_order)
select * from (values
  ('features', '첫 번째 기능', '관리자 페이지에서 이 카드를 수정해 보세요.', 1),
  ('features', '두 번째 기능', '이미지와 링크를 넣을 수도 있어요.', 2),
  ('features', '세 번째 기능', '필요 없으면 삭제하면 됩니다.', 3)
) as v(section, title, description, sort_order)
where not exists (select 1 from public.items);

-- 5) 사이트 글자(히어로 제목 등)를 저장하는 표
--    key 예시: 'hero.title' / value: 관리자 페이지에서 입력한 글자
--    값이 없으면 site.config.ts 의 글자가 대신 보입니다.
create table if not exists public.site_texts (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.site_texts enable row level security;

drop policy if exists "Anyone can read site texts" on public.site_texts;
create policy "Anyone can read site texts"
  on public.site_texts for select
  to anon, authenticated
  using (true);

-- 6) 갤러리 피드(/gallery)용 칸 추가
--    author     : 올린 사람 이름
--    media_type : 'image'(사진) 또는 'video'(동영상) — 파일 주소는 image_url 칸을 함께 씀
alter table public.items add column if not exists author text;
alter table public.items add column if not exists media_type text not null default 'image';

-- 6-2) 올릴 때의 원래 파일 이름 (갤러리 리스트에 '파일명.확장자'로 보임)
alter table public.items add column if not exists file_name text;

-- 7) 사진·동영상 저장 공간 한 파일 최대 50MB (동영상용)
update storage.buckets set file_size_limit = 52428800 where id = 'images';

-- 8) 회원 (학번 + 비밀번호로 로그인)
--    - 방문자·학생은 읽을 수 없음 (보안 규칙만 켜고 허용 규칙을 만들지 않음 → 서버의 비밀 키로만 읽고 씀)
--    - 비밀번호는 원래 글자가 아니라 되돌릴 수 없게 바꾼 값(password_hash)만 저장
--    - status: pending(승인 대기) / approved(승인) / rejected(거절)
create table if not exists public.members (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,                 -- 이름
  birth_date        date not null,                 -- 생년월일
  student_no        text not null unique,          -- 학번 (로그인 아이디)
  password_hash     text not null,                 -- 비밀번호(암호화)
  phone             text not null,                 -- 핸드폰 번호
  mother_phone      text,                          -- 보호자(어머니) 번호
  father_phone      text,                          -- 보호자(아버지) 번호
  zonecode          text not null,                 -- 우편번호
  address           text not null,                 -- 도로명 주소
  address_detail    text,                          -- 상세 주소
  email             text,                          -- 이메일 (선택)
  photo_path        text not null,                 -- 프로필 사진 (잠긴 저장 공간 profiles 안의 위치)
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  privacy_agreed_at timestamptz not null default now(), -- 개인정보 수집·이용 동의 시각
  created_at        timestamptz not null default now(),
  constraint members_guardian_phone check (mother_phone is not null or father_phone is not null)
);

alter table public.members enable row level security;

-- 게시물을 쓴 회원 (갤러리 글 ↔ 회원 연결)
alter table public.items add column if not exists member_id uuid references public.members(id) on delete set null;
create index if not exists items_member_idx on public.items (member_id);

-- 9) 프로필 사진 저장 공간 — 잠긴(비공개) 버킷, 관리자 페이지에서만 잠깐 열어 볼 수 있음
insert into storage.buckets (id, name, public, file_size_limit)
values ('profiles', 'profiles', false, 5242880)
on conflict (id) do nothing;

-- 10) 학급 일정 (첫 화면 캘린더)
--     category: school(학교일정) / exam(평가일정) / assignment(과제기한)
--     누구나 읽을 수 있고, 쓰기·고치기는 서버에서 관리자 또는 '일정 권한'이 있는 회원만
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('school', 'exam', 'assignment')),
  title       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  memo        text,
  created_by  text,                                          -- 작성한 사람 이름 (관리자 / 회원 이름)
  member_id   uuid references public.members(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint events_time_order check (ends_at >= starts_at)
);

create index if not exists events_starts_idx on public.events (starts_at);

alter table public.events enable row level security;

drop policy if exists "Anyone can read events" on public.events;
create policy "Anyone can read events"
  on public.events for select
  to anon, authenticated
  using (true);

-- 회원에게 일정 쓰기 권한 (관리자 페이지 '회원' 탭에서 켜고 끔)
alter table public.members add column if not exists can_edit_schedule boolean not null default false;

-- 11) To teacher! (선생님께 제출하는 글 — 사이트에 공개되지 않음)
--     - 쓴 학생 본인과 선생님(관리자)만 볼 수 있음 (허용 규칙 없음 → 서버의 비밀 키로만 읽고 씀)
--     - files: 올린 파일 목록 [{ "path", "name", "size", "type" }] — 파일은 잠긴 저장 공간 submissions 에
--     - reply: 선생님 답글
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  title       text not null,
  content     text,
  files       jsonb not null default '[]'::jsonb,
  reply       text,
  replied_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists submissions_member_idx on public.submissions (member_id, created_at desc);

alter table public.submissions enable row level security;

-- 제출 파일 저장 공간 — 잠긴(비공개) 버킷, 파일 하나 최대 20MB
insert into storage.buckets (id, name, public, file_size_limit)
values ('submissions', 'submissions', false, 20971520)
on conflict (id) do nothing;

-- 12) 공지사항 (/notice) — items 표의 section = 'notice' 글을 그대로 씀
--     attachments: 첨부 파일 목록 [{ "path", "name", "size", "type", "url" }] (공개 저장 공간 images/notices/ 에)
alter table public.items add column if not exists attachments jsonb not null default '[]'::jsonb;

-- 회원에게 공지사항 쓰기 권한 (관리자 페이지 '회원' 탭에서 켜고 끔)
alter table public.members add column if not exists can_write_notice boolean not null default false;

-- Supabase가 새 표·칸을 바로 알아보도록 새로고침
notify pgrst, 'reload schema';
