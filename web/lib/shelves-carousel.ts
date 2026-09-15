import { getDirectusUrl } from "@/lib/directus";

export type CarouselSlide = {
  type: "image" | "video";
  /** Directus file UUID, absolute URL, or site path */
  src: string;
  poster?: string;
  title?: string;
  body?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolve Directus file ids /files/{id} and bare UUIDs to /assets/{id}. */
export function resolveMediaUrl(src: string) {
  if (!src) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const filesMatch = src.match(/^\/files\/([0-9a-f-]{36})(?:\?.*)?$/i);
  if (filesMatch) return `${getDirectusUrl()}/assets/${filesMatch[1]}`;

  if (UUID_RE.test(src)) return `${getDirectusUrl()}/assets/${src}`;

  // Site paths like /media/...
  if (src.startsWith("/")) return src;

  return `${getDirectusUrl()}/assets/${encodeURIComponent(src)}`;
}

/** Smaller variants for carousel (Safari / mobile friendly). */
export function carouselImageUrl(src: string, width = 786) {
  const url = resolveMediaUrl(src);
  if (!url.includes("/assets/")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${width}&quality=85&format=webp`;
}

export function carouselPosterUrl(src: string) {
  return carouselImageUrl(src, 400);
}

/** Full-frame cover shown while video buffers (sharp then blurred). */
export function carouselCoverUrl(src: string) {
  return carouselImageUrl(src, 786);
}

export function carouselVideoUrl(src: string) {
  return resolveMediaUrl(src);
}

/** Production assets uploaded to cms.reelshub.pro File Library */
export const DEFAULT_SHELVES_SLIDES: CarouselSlide[] = [
  {
    type: "image",
    src: "081d2997-6503-4c26-8d1b-09d629821792",
    title: "Почувствовать силу Алтая",
    body: "Место, где мысли замолкают, а сердце начинает биться в ритме гор",
  },
  {
    type: "image",
    src: "2c59e822-faff-4108-8f25-19770cc83349",
  },
  {
    type: "image",
    src: "878f2507-98a8-4f8d-ac83-1afeae98658f",
  },
  {
    type: "video",
    src: "77801abe-caf7-4e5b-9ac8-dbd9c220a02a",
    poster: "081d2997-6503-4c26-8d1b-09d629821792",
  },
];
