/* ==========================================================================
   ★ 사이트 내용 설정 파일
   --------------------------------------------------------------------------
   사이트에 보이는 글자(이름, 소개, 메뉴, 연락처 등)는 대부분 여기에 있습니다.
   따옴표 " " 안의 글자만 바꾸고 저장하면 화면에 바로 반영됩니다.
   (따옴표, 쉼표, 중괄호 { } 는 지우지 않도록 조심!)
   ========================================================================== */

import type { Item } from "@/lib/types";

export const siteConfig = {
  /* 브라우저 탭 제목과 검색 결과에 보이는 정보 */
  name: "Class Studio",
  title: "My Studio — 나의 첫 웹사이트",
  description: "바이브 코딩으로 만든 나의 웹사이트입니다.",

  /* 상단 메뉴 (href 의 #이름 은 아래 섹션의 id 와 같아야 해당 위치로 이동) */
  nav: [
    { label: "일정", href: "#schedule" },
    { label: "새 글", href: "#recent" },
    { label: "갤러리", href: "#gallery" },
    { label: "To teacher!", href: "#to-teacher" },
  ],

  /* 왼쪽 사이드바(전체 메뉴)의 묶음 제목 */
  sidebar: {
    sectionsTitle: "둘러보기", // 일정·새 글·갤러리·To teacher!
    classTitle: "우리반", // 히어로 버튼들 (공지사항·자료실·공부방·토론방) + 자리배치도
    adminTitle: "관리",
  },

  /* 상단 메뉴 오른쪽 버튼 (누르면 새 탭에서 관리자 페이지가 열림) */
  secretButton: { label: "비밀버튼", href: "/admin" },

  /* 첫 화면(히어로) */
  hero: {
    eyebrow: "Hello, World",
    title: "응답하라!\n3학년 O반 ♥",
    description:
      "이 문장을 바꿔 나를 소개해 보세요. site.config.ts 파일에서 글자만 바꾸면 여기가 바뀝니다.",
    primaryCta: { label: "공지사항", href: "/notice" },
    secondaryCta: { label: "자료실", href: "#gallery" },
    thirdCta: { label: "공부방", href: "#recent" },
    fourthCta: { label: "토론방", href: "#recent" },
  },

  /* 소개 섹션 (지금은 첫 화면에서 뺐음 — 다시 넣으려면 app/page.tsx 에 <About /> 추가) */
  about: {
    eyebrow: "About",
    title: "소개",
    paragraphs: [
      "여기에 나 또는 우리 팀, 가게, 프로젝트에 대한 소개를 적습니다.",
      "두 번째 문단도 필요하면 이렇게 줄을 추가하면 됩니다.",
    ],
    // 오른쪽 반 친구들 일러스트 설명 (화면 읽기 프로그램용)
    imageAlt: "교실 칠판 앞에서 단체 사진을 찍는 반 친구들 일러스트",
  },

  /* 자리배치도 (/seating) — 사이드바 '우리반' 아래
     - rows·cols: 책상 줄 수 × 한 줄 책상 수 (교탁에서 가까운 줄부터)
     - 자리에 앉는 사람 = 가입이 승인된 회원. [랜덤 자리 바꾸기]는 관리자(선생님)만 보임 */
  seating: {
    label: "자리배치도",
    title: "우리반 자리배치도",
    description: "교탁(칠판) 쪽이 위예요. 내 이름을 찾아보세요!",
    rows: 5,
    cols: 6,
    deskLabel: "교탁",
    emptySeatLabel: "빈자리",
    shuffleLabel: "랜덤 자리 바꾸기",
    shuffleConfirm: "자리를 새로 랜덤으로 정할까요? 지금 자리배치는 사라져요.",
    notArrangedText: "아직 자리를 정하지 않았어요.",
    unseatedText: "명은 아직 자리가 없어요. (새로 가입한 친구 등) 랜덤 자리 바꾸기를 하면 들어가요.",
  },

  /* 공부방 하위 방 (사이드바에서 '공부방'에 마우스를 올리면 펼쳐짐, 주소: /study/key)
     - key 는 주소에 쓰이는 영문 이름이라 바꾸지 않는 게 좋아요. label·description 은 바꿔도 됩니다.
     - 각 방의 실제 기능(글쓰기 등)은 아직 준비 중 */
  studyRooms: {
    title: "공부방",
    comingSoonText: "이 방은 아직 준비 중이에요. 곧 열릴 거예요!",
    rooms: [
      { key: "materials", label: "자료실", icon: "folder", description: "수업 자료와 참고 자료를 모아 두는 곳" },
      { key: "questions", label: "질문방", icon: "question", description: "공부하다 궁금한 것을 묻고 답하는 곳" },
      { key: "quiz", label: "퀴즈방", icon: "quiz", description: "배운 내용을 퀴즈로 확인해 보는 곳" },
      { key: "assignments", label: "과제방", icon: "assignment", description: "과제를 확인하고 내는 곳" },
    ],
  },

  /* 자료실 (공부방 > 자료실, /study/materials) — 가입이 승인된 회원이라면 누구나 글을 쓸 수 있음 */
  materials: {
    writeLabel: "글쓰기",
    writeTitle: "자료 올리기",
    submitLabel: "자료 올리기",
    closeLabel: "닫기",
    fileHint: "사진, PDF, 한글·워드·파워포인트·엑셀, zip, 동영상(mp4) — 파일 하나 20MB, 5개까지",
    emptyText: "아직 올라온 자료가 없어요. 첫 자료를 올려 보세요!",
    attachmentsLabel: "첨부 파일",
    doneText: "자료를 올렸어요.",
    loginRequiredText: "로그인한 회원은 누구나 자료를 올릴 수 있어요. 오른쪽 위에서 로그인해 주세요.",
    pendingText: "가입 승인을 기다리고 있어요. 승인되면 자료를 올릴 수 있어요.",
  },

  /* 공지사항 페이지 (/notice) — 히어로의 '공지사항' 버튼과 사이드바에서 열림
     - 날짜별로 묶어서 최신순, 오른쪽 위 글쓰기 버튼 (관리자와 '공지 권한'을 받은 회원만 보임)
     - 관리자 페이지 '공지사항' 탭, '최근 7일 새 글' 창과 같은 글 */
  notice: {
    eyebrow: "Notice",
    title: "공지사항",
    description: "선생님이 알려 드리는 소식이에요. 날짜별로 모아 두었어요.",
    writeLabel: "글쓰기",
    writeTitle: "공지사항 쓰기",
    submitLabel: "공지사항 올리기",
    closeLabel: "닫기",
    fileHint: "사진, PDF, 한글·워드·파워포인트·엑셀, zip, 동영상(mp4) — 파일 하나 20MB, 5개까지",
    emptyText: "아직 올라온 공지사항이 없어요.",
    attachmentsLabel: "첨부 파일",
  },

  /* 학급 일정 캘린더 (히어로 바로 아래, 최근 새 글 위)
     - 일정은 관리자 또는 관리자가 '일정 권한'을 준 회원만 쓰고 고칠 수 있음 (관리자 페이지 '회원' 탭)
     - categories 의 key 는 바꾸지 마세요 (데이터베이스와 같아야 함). label 만 바꿔도 됩니다. */
  schedule: {
    eyebrow: "Calendar",
    title: "학급 일정",
    allLabel: "전체",
    categories: [
      { key: "school", label: "학교일정" },
      { key: "exam", label: "평가일정" },
      { key: "assignment", label: "과제기한" },
    ],
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    todayLabel: "오늘",
    addLabel: "일정 추가",
    editLabel: "일정 수정",
    deleteLabel: "삭제",
    closeLabel: "닫기",
    editHint: "일정을 누르면 고칠 수 있어요. 날짜에 마우스를 올리면 + 버튼이 나와요.",
  },

  /* 최근 새 글 창 (히어로 바로 아래)
     - 관리자의 '공지사항'·'공부방' 탭에 올린 글 중 최근 days 일 동안의 글을 최신순으로 보여줌
     - sections 의 key 는 아래 adminSections 의 key 와 같아야 함 */
  recentPosts: {
    eyebrow: "New",
    title: "최근 7일 새 글",
    days: 7,
    allLabel: "전체",
    emptyText: "최근 일주일 동안 올라온 새 글이 없어요.",
    sections: [
      { key: "notice", label: "공지사항" },
      { key: "study", label: "공부방" },
    ],
  },

  /* 갤러리 섹션 (예전 '기능' 섹션) — 사진과 글은 관리자 페이지(/admin)의 '갤러리' 탭에서 올림
     - 첫 화면에는 가장 최근에 올린 previewCount 장만 미리보기로 보이고,
       제목을 누르면 새 탭에서 갤러리 피드 페이지(/gallery)가 열림 */
  features: {
    eyebrow: "Gallery",
    title: "갤러리",
    description: "우리반의 사진과 이야기를 모아 두는 곳이에요. 제목을 누르면 갤러리 피드가 새 창으로 열려요.",
    previewCount: 4,
    openHint: "전체 보기",
    emptyText: "아직 갤러리에 올라온 사진이 없어요.",
  },

  /* 연락처 섹션 */
  contact: {
    eyebrow: "Contact",
    title: "함께 이야기해요",
    description: "궁금한 점이 있다면 언제든 연락 주세요.",
    email: "hello@example.com",
    links: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },

  /* 갤러리 피드 페이지 (/gallery) — 인스타그램처럼 사진·동영상 게시물을 위아래로 넘겨 보는 곳 */
  galleryPage: {
    title: "우리반 갤러리",
    description: "사진과 동영상으로 우리반의 하루를 기록해요.",
    backLabel: "홈으로",
    emptyText: "아직 올라온 게시물이 없어요. 첫 게시물을 올려 보세요!",
    writeLabel: "글쓰기", // 오른쪽 아래 떠 있는 버튼
    uploadTitle: "새 게시물 올리기", // 글쓰기 창 제목
    uploadHint: "사진 10MB, 동영상 50MB까지 올릴 수 있어요. 올리면 갤러리에 바로 보여요.",
    uploadDoneText: "올렸어요! 새로고침하면 갤러리에서 볼 수 있어요.",
    loginRequiredText: "글쓰기는 회원만 할 수 있어요. 홈 화면 오른쪽 위에서 로그인하거나 회원가입해 주세요.",
    pendingText: "가입 승인을 기다리고 있어요. 선생님이 승인하면 글을 쓸 수 있어요.",
    anonymous: "익명",
    shareLabel: "공유",
    shareCopiedText: "링크를 복사했어요",
    downloadLabel: "다운로드",
    listLabel: "리스트", // 오른쪽 아래 떠 있는 버튼 (글쓰기 위)
    listTitle: "게시물 리스트", // 리스트 창 제목
    listColumns: { author: "작성자", title: "제목", file: "파일명" },
    closeLabel: "닫기",
  },

  /* 회원 (상단 메뉴의 로그인·회원가입) */
  members: {
    loginLabel: "로그인",
    signupLabel: "회원가입",
    logoutLabel: "로그아웃",
    loginTitle: "로그인",
    signupTitle: "회원가입",
    closeLabel: "닫기",
    pendingBadge: "승인 대기",
    signupDoneText: "가입 신청을 마쳤어요! 선생님이 승인하면 갤러리에 바로 글을 쓸 수 있어요.",
    addressSearchLabel: "주소 검색",
    // 회원가입 창 프로필 사진 칸 아래 안내 문구
    photoHint:
      "내 얼굴이 잘 드러난 사진을 올려 주세요. (캐릭터·풍경·단체 사진은 안 돼요) 4MB 이하 이미지이고, 내가 쓴 갤러리 글에 이름과 함께 작게 보여요.",
    // 개인정보 수집·이용 동의 (가입 창 맨 아래). 학교 방침에 맞게 고쳐 쓰세요.
    privacy: {
      title: "개인정보 수집·이용 동의 (필수)",
      items: [
        "수집 항목: 이름, 생년월일, 학번, 핸드폰 번호, 보호자 핸드폰 번호, 집 주소, 이메일(선택), 프로필 사진",
        "이용 목적: 학급 사이트 회원 확인, 학급 운영 연락",
        "공개 범위: 이름과 프로필 사진은 내가 쓴 갤러리 글에 작게 보여요. 나머지 정보는 선생님(관리자)만 볼 수 있어요.",
        "보관 기간: 학년이 끝나거나 탈퇴를 요청할 때까지 (이후 바로 삭제)",
        "만 14세 미만은 보호자가 함께 확인하고 동의해야 해요.",
      ],
      agreeLabel: "위 내용을 읽었고 개인정보 수집·이용에 동의합니다. (만 14세 미만은 보호자와 함께 확인했습니다.)",
    },
  },

  /* To teacher! (예전 '연락처' 자리) — 선생님께만 보내는 글·파일
     - 승인된 회원만 보낼 수 있음
     - 보낸 글은 선생님(관리자 페이지 'To teacher!' 탭)과 보낸 학생 본인(마이페이지)만 볼 수 있음
     - 선생님이 답글을 달면, 보낸 학생이 마이페이지에서 읽을 수 있음 */
  toTeacher: {
    eyebrow: "To teacher!",
    title: "선생님께 보내기",
    description: "숙제, 과제 파일, 사진, 하고 싶은 말을 선생님께만 보내요. 홈페이지에는 올라가지 않아요. 선생님 답글은 마이페이지에서 볼 수 있어요.",
    writeLabel: "글쓰기",
    writeTitle: "선생님께 보내기",
    closeLabel: "닫기",
    fileHint: "사진, PDF, 한글·워드·파워포인트·엑셀, zip, 동영상(mp4) — 파일 하나 20MB, 5개까지",
    sendLabel: "보내기",
    sendDoneText: "선생님께 보냈어요! 보낸 글과 선생님 답글은 마이페이지에서 볼 수 있어요.",
    sendWarning: "보낸 뒤에는 고칠 수 없어요. 꼼꼼히 확인하고 보내 주세요.",
    loginRequiredText: "로그인한 회원만 선생님께 글을 보낼 수 있어요. 오른쪽 위에서 로그인하거나 회원가입해 주세요.",
    pendingText: "가입 승인을 기다리고 있어요. 선생님이 승인하면 글을 보낼 수 있어요.",
  },


  /* 마이페이지 (/mypage) — 로그인한 회원 본인만. 선생님께 보낸 글과 선생님 답글 */
  myPage: {
    label: "마이페이지",
    title: "마이페이지",
    submissionsTitle: "선생님께 보낸 글",
    emptyText: "아직 선생님께 보낸 글이 없어요.",
    replyTitle: "선생님 답글",
    noReplyText: "아직 선생님 답글이 없어요.",
    newReplyBadge: "답글 도착",
    loginRequiredText: "마이페이지는 로그인한 회원만 볼 수 있어요. 오른쪽 위에서 로그인해 주세요.",
  },

  /* 맨 아래(푸터) */
  footer: {
    copyright: "© 2026 My Studio. All rights reserved.",
  },

  /* 관리자 페이지에서 관리할 섹션 목록.
     key  = 데이터베이스에 저장되는 이름(영문 소문자),
     label = 관리자 화면에 보이는 이름.
     예) 포트폴리오라면 { key: "works", label: "작업물" } 을 추가 */
  adminSections: [
    { key: "features", label: "갤러리" }, // key 는 예전 이름 그대로 (이미 올린 사진이 유지되도록)
    { key: "notice", label: "공지사항" },
    { key: "study", label: "공부방" },
    { key: "materials", label: "자료실" },
  ],
};

/* Supabase를 아직 연결하지 않았을 때 대신 보여줄 예시 카드.
   Supabase를 연결하면 이 내용 대신 관리자 페이지에서 등록한 카드가 보입니다. */
export const sampleItems: Item[] = [
  {
    id: "sample-1",
    section: "features",
    title: "첫 번째 기능",
    description: "카드 하나에 제목, 설명, 이미지, 링크를 넣을 수 있어요.",
    image_url: null,
    link_url: null,
    sort_order: 1,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sample-2",
    section: "features",
    title: "두 번째 기능",
    description: "관리자 페이지에서 순서를 바꾸거나 숨길 수도 있어요.",
    image_url: null,
    link_url: null,
    sort_order: 2,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sample-3",
    section: "features",
    title: "세 번째 기능",
    description: "포트폴리오라면 작업물, 가게라면 메뉴처럼 자유롭게 쓰세요.",
    image_url: null,
    link_url: null,
    sort_order: 3,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
];
