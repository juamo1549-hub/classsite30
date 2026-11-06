import { siteConfig } from "@/site.config";
import { getItems } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { GalleryCard } from "@/components/sections/gallery-card";
import { GalleryViewer } from "@/components/sections/gallery-viewer";

/* 갤러리 섹션 (예전 '기능' 섹션. 파일 이름은 그대로 둠).
   - 제목/설명/버튼 글자: site.config.ts 의 features
   - 사진과 글: 관리자 페이지(/admin)의 '갤러리' 탭에서 올림 (Supabase 연결 전에는 예시 카드가 보임)
   - 가장 최근에 올린 사진이 먼저 나옴 (미리보기와 갤러리 창 모두)
   - 첫 화면에는 최신 features.previewCount 장만 미리보기,
     제목·'전체 보기'를 누르면 새 탭에서 갤러리 피드 페이지(/gallery)가 열림 */
export async function Features() {
  const { features } = siteConfig;
  const items = (await getItems("features")).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const preview = items.slice(0, features.previewCount);

  return (
    <section id="gallery" className="scroll-mt-16 py-16 sm:py-24">
      <Container>
        <GalleryViewer
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
          openHint={features.openHint}
        />

        {preview.length === 0 ? (
          <p className="mt-12 font-bold">{features.emptyText}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((item, i) => (
              <GalleryCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
