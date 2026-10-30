import { sampleItems, siteConfig } from "@/site.config";
import { getPublicClient } from "@/lib/supabase";
import type { Item } from "@/lib/types";

/**
 * 특정 섹션의 카드 목록을 가져옵니다.
 * - Supabase가 연결 안 됐으면: site.config.ts 의 예시 카드를 보여줌
 * - 연결됐으면: 데이터베이스에서 '보이기'로 설정된 카드만 순서대로 가져옴
 */
export async function getItems(section: string): Promise<Item[]> {
  const supabase = getPublicClient();
  const samples = sampleItems.filter((item) => item.section === section);
  if (!supabase) return samples;

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("section", section)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getItems] Supabase 읽기 실패:", error.message);
    return samples;
  }
  return (data ?? []) as Item[];
}

/* ---------- 히어로 글자 ---------- */

/** 관리자 페이지에서 바꿀 수 있는 히어로 글자 칸 (site_texts 표의 key 가 'hero.이름') */
export const HERO_TEXT_KEYS = [
  "eyebrow",
  "title",
  "description",
  "primaryLabel",
  "secondaryLabel",
  "thirdLabel",
  "fourthLabel",
] as const;

export type HeroTextKey = (typeof HERO_TEXT_KEYS)[number];
export type HeroText = Record<HeroTextKey, string>;

/** site.config.ts 에 적힌 기본 히어로 글자 */
export function getDefaultHeroText(): HeroText {
  const { hero } = siteConfig;
  return {
    eyebrow: hero.eyebrow,
    title: hero.title,
    description: hero.description,
    primaryLabel: hero.primaryCta.label,
    secondaryLabel: hero.secondaryCta.label,
    thirdLabel: hero.thirdCta.label,
    fourthLabel: hero.fourthCta.label,
  };
}

/**
 * 히어로 글자를 가져옵니다.
 * - 관리자 페이지에서 저장한 글자가 있으면 그것을, 없거나 비어 있으면 site.config.ts 의 글자를 씀
 */
export async function getHeroText(): Promise<HeroText> {
  const text = getDefaultHeroText();
  const supabase = getPublicClient();
  if (!supabase) return text;

  const { data, error } = await supabase
    .from("site_texts")
    .select("key, value")
    .like("key", "hero.%");

  if (error) {
    console.error("[getHeroText] Supabase 읽기 실패:", error.message);
    return text;
  }

  for (const row of data ?? []) {
    const key = String(row.key).slice("hero.".length) as HeroTextKey;
    if (HERO_TEXT_KEYS.includes(key) && row.value.trim()) text[key] = row.value;
  }
  return text;
}
