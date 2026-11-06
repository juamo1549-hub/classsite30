import { siteConfig } from "@/site.config";
import { StandalonePage } from "@/components/layout/standalone-page";
import { RecentPosts } from "@/components/sections/recent-posts";

/* 최근 7일 새 글만 크게 보는 페이지 (주소: /recent) — 왼쪽 사이드바에서 새 창으로 열림 */

export const metadata = { title: `${siteConfig.recentPosts.title} | ${siteConfig.name}` };
export const dynamic = "force-dynamic";

export default function RecentPage() {
  return (
    <StandalonePage title={siteConfig.recentPosts.title}>
      <RecentPosts />
    </StandalonePage>
  );
}
