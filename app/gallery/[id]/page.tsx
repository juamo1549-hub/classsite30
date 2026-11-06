import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";

import { siteConfig } from "@/site.config";
import { getGalleryItem, toFeedPosts } from "@/lib/gallery";
import { StandalonePage } from "@/components/layout/standalone-page";
import { Button } from "@/components/ui/button";
import { GalleryFeedPost } from "@/components/sections/gallery-feed-post";

/* 갤러리 사진(게시물) 한 장만 보는 페이지 (주소: /gallery/게시물번호)
   - 갤러리의 '공유'를 누르면 이 주소가 복사됨
   - 카카오톡 등에 붙여넣으면 그 사진이 미리보기로 보이도록 정보를 넣어 둠 */

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/gallery/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const item = await getGalleryItem(id);
  if (!item) return { title: `${siteConfig.galleryPage.title} | ${siteConfig.name}` };

  const title = `${item.title} | ${siteConfig.galleryPage.title}`;
  const description = item.description?.slice(0, 120) || siteConfig.galleryPage.description;
  const isImage = item.image_url && item.media_type !== "video";
  return {
    title,
    description,
    openGraph: { title, description, ...(isImage ? { images: [item.image_url as string] } : {}) },
  };
}

export default async function GalleryPostPage(props: PageProps<"/gallery/[id]">) {
  const { id } = await props.params;
  const item = await getGalleryItem(id);
  if (!item) notFound();

  const [post] = await toFeedPosts([item]);
  const page = siteConfig.galleryPage;

  return (
    <StandalonePage title={page.title} mainClassName="mx-auto w-full max-w-xl space-y-6 px-4 py-8">
      <GalleryFeedPost
        post={post}
        labels={{ share: page.shareLabel, copied: page.shareCopiedText, download: page.downloadLabel }}
      />
      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/gallery">
            <LayoutGrid aria-hidden />
            {page.title} 전체 보기
          </Link>
        </Button>
      </div>
    </StandalonePage>
  );
}
