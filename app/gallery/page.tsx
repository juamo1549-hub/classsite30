import { siteConfig } from "@/site.config";
import { getItems } from "@/lib/data";
import { getCurrentMember } from "@/lib/member-auth";
import { toFeedPosts } from "@/lib/gallery";
import { StandalonePage } from "@/components/layout/standalone-page";
import {
  GalleryFeedPost,
  type FeedPost,
} from "@/components/sections/gallery-feed-post";
import { GalleryFab } from "@/components/sections/gallery-fab";

/* 갤러리 피드 페이지 (주소: /gallery)
   - 첫 화면 갤러리의 '전체 보기'를 누르면 새 탭으로 열림 (사이드바에서는 지금 창에서 바로)
   - 첫 화면과 같은 상단 메뉴 + 왼쪽 사이드바
   - 인스타그램처럼 게시물(사진·동영상)이 최신순으로 위아래로 이어짐
   - 오른쪽 아래 떠 있는 버튼: 리스트(작성자·제목·파일 목록) / 글쓰기(가입 승인된 회원만, 올리면 바로 보임)
   - 글자는 site.config.ts 의 galleryPage 에서 바꿉니다. */

export const metadata = {
  title: `${siteConfig.galleryPage.title} | ${siteConfig.name}`,
};

// 로그인한 사람마다 글쓰기 칸이 달라서, 방문할 때마다 새로 그림
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const page = siteConfig.galleryPage;
  const member = await getCurrentMember();
  const items = (await getItems("features")).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const posts: FeedPost[] = await toFeedPosts(items);

  return (
    <StandalonePage
      title={page.title}
      mainClassName="mx-auto w-full max-w-xl space-y-8 px-4 py-8"
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-2 font-medium text-muted-foreground">
          {page.description}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed px-5 py-12 text-center font-medium text-muted-foreground">
          {page.emptyText}
        </p>
      ) : (
        posts.map((post) => (
          <GalleryFeedPost
            key={post.id}
            post={post}
            labels={{
              share: page.shareLabel,
              copied: page.shareCopiedText,
              download: page.downloadLabel,
            }}
          />
        ))
      )}

      <GalleryFab
        posts={posts}
        member={member}
        labels={{
          write: page.writeLabel,
          writeTitle: page.uploadTitle,
          uploadHint: page.uploadHint,
          list: page.listLabel,
          listTitle: page.listTitle,
          columns: page.listColumns,
          download: page.downloadLabel,
          close: page.closeLabel,
          emptyText: page.emptyText,
          loginRequired: page.loginRequiredText,
          pending: page.pendingText,
        }}
      />
    </StandalonePage>
  );
}
