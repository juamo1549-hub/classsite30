import { siteConfig } from "@/site.config";
import { getRecentItems } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { Window } from "@/components/ui/window";
import { RecentPostsList, type RecentPost } from "@/components/sections/recent-posts-list";

/* 최근 새 글 창 (히어로와 소개 사이).
   - 글자(제목, 빈 목록 문구 등)와 보여줄 기간·분류는 site.config.ts 의 recentPosts 에서 바꿉니다.
   - 글은 관리자 페이지(/admin)의 '공지사항'·'공부방' 탭에서 올립니다. */
export async function RecentPosts() {
  const { recentPosts } = siteConfig;
  const items = await getRecentItems(
    recentPosts.sections.map((s) => s.key),
    recentPosts.days
  );

  // 날짜는 서버에서 한국 시간으로 미리 글자로 만들어 둠 (예: "11월 6일")
  const posts: RecentPost[] = items.map((item) => ({
    id: item.id,
    section: item.section,
    title: item.title,
    description: item.description,
    link: item.link_url,
    date: new Date(item.created_at).toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      timeZone: "Asia/Seoul",
    }),
  }));

  return (
    <section id="recent" className="scroll-mt-16">
      <Container>
        <Window title={recentPosts.eyebrow} bodyClassName="p-6 sm:p-8">
          <RecentPostsList
            title={recentPosts.title}
            allLabel={recentPosts.allLabel}
            emptyText={recentPosts.emptyText}
            sections={recentPosts.sections}
            posts={posts}
          />
        </Window>
      </Container>
    </section>
  );
}
