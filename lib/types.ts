/** 관리자 페이지에서 관리하는 카드(항목) 한 개의 모양. supabase/schema.sql 의 items 테이블과 같습니다. */
export type Item = {
  id: string;
  /** 어느 섹션에 속하는지 (예: "features") */
  section: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  /** 작은 숫자가 먼저 보임 */
  sort_order: number;
  /** false 면 사이트에서 숨김 */
  is_visible: boolean;
  created_at: string;
  /** 올린 사람 이름 (갤러리 피드) */
  author?: string | null;
  /** "image"(사진) 또는 "video"(동영상). 파일 주소는 image_url */
  media_type?: string | null;
  /** 올릴 때의 원래 파일 이름 (예: 체육대회.jpg) */
  file_name?: string | null;
  /** 글을 쓴 회원 (members.id) */
  member_id?: string | null;
  /** 첨부 파일 (공지사항) */
  attachments?: Attachment[] | null;
};

/** 공지사항 첨부 파일 하나 (공개 저장 공간 images/notices/ 안) */
export type Attachment = { path: string; name: string; size: number; type: string; url: string };

/** 회원 가입 상태: 승인 대기 / 승인 / 거절 */
export type MemberStatus = "pending" | "approved" | "rejected";

/** 회원 한 명 (supabase/schema.sql 의 members 표, 비밀번호 제외). 관리자 페이지에서만 전체를 봄 */
export type Member = {
  id: string;
  name: string;
  birth_date: string;
  student_no: string;
  phone: string;
  mother_phone: string | null;
  father_phone: string | null;
  zonecode: string;
  address: string;
  address_detail: string | null;
  email: string | null;
  photo_path: string;
  status: MemberStatus;
  privacy_agreed_at: string;
  created_at: string;
  /** 학급 일정(캘린더)을 쓰고 고칠 수 있는지 */
  can_edit_schedule?: boolean;
  /** 공지사항을 쓸 수 있는지 */
  can_write_notice?: boolean;
};

/** 로그인한 사람에 대해 화면에 넘겨도 되는 최소 정보 */
export type SessionMember = { id: string; name: string; status: MemberStatus };

/** 일정 분류: 학교일정 / 평가일정 / 과제기한 */
export type EventCategory = "school" | "exam" | "assignment";

/** 학급 일정 한 개 (supabase/schema.sql 의 events 표) */
export type ScheduleEvent = {
  id: string;
  category: EventCategory;
  title: string;
  starts_at: string;
  ends_at: string;
  memo: string | null;
  created_by: string | null;
};

/** To teacher! 제출 파일 하나 (잠긴 저장 공간 submissions 안의 위치 + 원래 이름) */
export type SubmissionFile = { path: string; name: string; size: number; type: string };

/** To teacher! 제출 글 하나 (쓴 학생 본인과 관리자만 봄) */
export type Submission = {
  id: string;
  member_id: string;
  title: string;
  content: string | null;
  files: SubmissionFile[];
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
};

/** 화면에 넘길 때: 파일마다 1시간짜리 내려받기 주소를 붙임 */
export type SubmissionView = Omit<Submission, "files"> & {
  files: (SubmissionFile & { url: string | null })[];
  /** 관리자 화면용: 쓴 학생 이름·학번 */
  author?: { name: string; student_no: string };
};
