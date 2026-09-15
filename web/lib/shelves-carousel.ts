export type CarouselSlide = {
  type: "image" | "video";
  /** Directus file UUID, absolute URL, or site path */
  src: string;
  poster?: string;
  title?: string;
  body?: string;
};

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
    src: "39cc7423-f6d7-48b9-890d-043f0d813c6c",
    poster: "081d2997-6503-4c26-8d1b-09d629821792",
  },
];
