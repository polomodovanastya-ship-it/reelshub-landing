"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  carouselCoverUrl,
  carouselImageUrl,
  carouselVideoUrl,
  type CarouselSlide,
} from "@/lib/shelves-carousel";

export type { CarouselSlide };

const IMAGE_DURATION_MS = 5000;
const PROGRESS_TICK_MS = 120;
/** Minimum time to show blurred cover so the handoff feels intentional */
const COVER_BLUR_MIN_MS = 450;

function PauseIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
      <rect x="1" y="1" width="4" height="14" rx="1.5" fill="#fff" />
      <rect x="9" y="1" width="4" height="14" rx="1.5" fill="#fff" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
      <path d="M2 1.5v13l11-6.5L2 1.5z" fill="#fff" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden>
      <path
        d="M9.5 2.5L3 9l6.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden>
      <path
        d="M2.5 2.5L9 9l-6.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9.5v5h3.2L12 18.5V5.5L7.2 9.5H4z"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 9.5l4 4M19.5 9.5l-4 4"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9.5v5h3.2L12 18.5V5.5L7.2 9.5H4z"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 9.2a3.8 3.8 0 010 5.6M17.6 7a6.5 6.5 0 010 10"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function videoCoverSrc(slides: CarouselSlide[], videoSlide: CarouselSlide) {
  if (videoSlide.poster) return carouselCoverUrl(videoSlide.poster);
  const firstImage = slides.find((s) => s.type === "image");
  if (firstImage) return carouselCoverUrl(firstImage.src);
  return undefined;
}

export function ShelfCarousel({
  slides,
  locale = "ru",
}: {
  slides: CarouselSlide[];
  locale?: "ru" | "en";
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  /** Video is buffered enough to play; cover can fade out */
  const [videoReady, setVideoReady] = useState(false);
  const [coverBlur, setCoverBlur] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inViewRef = useRef(true);
  const indexRef = useRef(index);
  const pausedRef = useRef(paused);
  const mutedRef = useRef(muted);
  const videoReadyRef = useRef(false);
  const imageStartedRef = useRef(0);
  const imageAccruedRef = useRef(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const imageAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoEnteredAtRef = useRef(0);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  indexRef.current = index;
  pausedRef.current = paused;
  mutedRef.current = muted;
  videoReadyRef.current = videoReady;

  const slide = slides[index];
  const isVideo = slide?.type === "video";
  const videoIndex = slides.findIndex((s) => s.type === "video");

  const labels =
    locale === "en"
      ? {
          region: "Reels shelves",
          play: "Play",
          pause: "Pause",
          prev: "Previous",
          next: "Next",
          mute: "Mute",
          unmute: "Unmute",
        }
      : {
          region: "Полки роликов",
          play: "Воспроизвести",
          pause: "Пауза",
          prev: "Назад",
          next: "Вперёд",
          mute: "Выключить звук",
          unmute: "Включить звук",
        };

  const clearTimers = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (imageAdvanceRef.current) {
      clearTimeout(imageAdvanceRef.current);
      imageAdvanceRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (count === 0) return;
      const i = ((nextIndex % count) + count) % count;
      videoRef.current?.pause();
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      setIndex(i);
      setProgress(0);
      imageAccruedRef.current = 0;
      imageStartedRef.current = performance.now();
      if (slides[i]?.type === "video") {
        setMuted(true);
        setVideoReady(false);
        setCoverBlur(false);
        videoEnteredAtRef.current = performance.now();
      } else {
        setVideoReady(false);
        setCoverBlur(false);
      }
    },
    [count, slides]
  );

  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  const scheduleImageAdvance = useCallback(
    (delayMs: number) => {
      if (imageAdvanceRef.current) clearTimeout(imageAdvanceRef.current);
      imageAdvanceRef.current = setTimeout(() => {
        if (!pausedRef.current && slides[indexRef.current]?.type === "image") {
          goNext();
        }
      }, Math.max(0, delayMs));
    },
    [goNext, slides]
  );

  const syncVideoPlayState = useCallback(() => {
    const video = videoRef.current;
    if (!video || slides[indexRef.current]?.type !== "video") return;
    if (!inViewRef.current || pausedRef.current || !videoReadyRef.current) {
      video.pause();
      return;
    }
    video.muted = mutedRef.current;
    const playPromise = video.play();
    if (playPromise) {
      void playPromise.catch(() => setPaused(true));
    }
  }, [slides]);

  const revealVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || slides[indexRef.current]?.type !== "video") return;
    if (videoReadyRef.current) return;

    const elapsed = performance.now() - videoEnteredAtRef.current;
    const wait = Math.max(0, COVER_BLUR_MIN_MS - elapsed);

    const finish = () => {
      setVideoReady(true);
      videoReadyRef.current = true;
      if (!pausedRef.current && inViewRef.current) {
        video.muted = mutedRef.current;
        void video.play().catch(() => setPaused(true));
      }
    };

    if (wait > 0) {
      revealTimerRef.current = setTimeout(finish, wait);
    } else {
      finish();
    }
  }, [slides]);

  const startImageTimers = useCallback(() => {
    clearTimers();
    imageStartedRef.current = performance.now();

    progressTimerRef.current = setInterval(() => {
      if (pausedRef.current || slides[indexRef.current]?.type !== "image") return;
      const elapsed =
        imageAccruedRef.current + (performance.now() - imageStartedRef.current);
      setProgress(Math.min(1, elapsed / IMAGE_DURATION_MS));
    }, PROGRESS_TICK_MS);

    scheduleImageAdvance(IMAGE_DURATION_MS - imageAccruedRef.current);
  }, [clearTimers, scheduleImageAdvance, slides]);

  const togglePause = () => {
    setPaused((p) => {
      const nextPaused = !p;
      const video = videoRef.current;
      if (nextPaused) {
        if (slides[indexRef.current]?.type === "image") {
          imageAccruedRef.current +=
            performance.now() - imageStartedRef.current;
        }
        if (video) video.pause();
        clearTimers();
      } else {
        imageStartedRef.current = performance.now();
        if (slides[indexRef.current]?.type === "image") {
          const remaining = IMAGE_DURATION_MS - imageAccruedRef.current;
          progressTimerRef.current = setInterval(() => {
            if (
              pausedRef.current ||
              slides[indexRef.current]?.type !== "image"
            )
              return;
            const elapsed =
              imageAccruedRef.current +
              (performance.now() - imageStartedRef.current);
            setProgress(Math.min(1, elapsed / IMAGE_DURATION_MS));
          }, PROGRESS_TICK_MS);
          scheduleImageAdvance(remaining);
        } else if (videoReadyRef.current) {
          syncVideoPlayState();
        }
      }
      return nextPaused;
    });
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      const video = videoRef.current;
      if (video) video.muted = next;
      return next;
    });
  };

  // Entering video slide: show cover, start blur, load video underneath
  useLayoutEffect(() => {
    if (slides[index]?.type !== "video") return;

    setVideoReady(false);
    videoReadyRef.current = false;
    setCoverBlur(false);
    videoEnteredAtRef.current = performance.now();
    setProgress(0);

    // Kick blur on next frame so the sharp cover paints first
    const blurKick = requestAnimationFrame(() => {
      setCoverBlur(true);
    });

    return () => {
      cancelAnimationFrame(blurKick);
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [index, slides]);

  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el || slides[index]?.type !== "video") return;

    el.muted = true;
    el.defaultMuted = true;

    const onTime = () => {
      if (!videoReadyRef.current) return;
      if (!el.duration || !Number.isFinite(el.duration)) return;
      setProgress(Math.min(1, el.currentTime / el.duration));
    };
    const onEnded = () => goNext();
    const onReady = () => revealVideo();

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    el.addEventListener("canplay", onReady);
    el.addEventListener("canplaythrough", onReady);

    // Force load after mount
    try {
      el.load();
    } catch {
      /* ignore */
    }

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onReady();
    }

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("canplaythrough", onReady);
    };
  }, [index, slides, goNext, revealVideo]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          videoRef.current?.pause();
          clearTimers();
        } else if (!pausedRef.current) {
          if (slides[indexRef.current]?.type === "image") {
            startImageTimers();
          } else if (videoReadyRef.current) {
            syncVideoPlayState();
          }
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(root);
    return () => obs.disconnect();
  }, [clearTimers, slides, startImageTimers, syncVideoPlayState]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        clearTimers();
      } else if (!pausedRef.current && inViewRef.current) {
        if (slides[indexRef.current]?.type === "image") startImageTimers();
        else if (videoReadyRef.current) syncVideoPlayState();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [clearTimers, slides, startImageTimers, syncVideoPlayState]);

  useLayoutEffect(() => {
    clearTimers();
    setProgress(0);
    imageAccruedRef.current = 0;
    imageStartedRef.current = performance.now();

    if (!inViewRef.current || paused) return;
    if (slides[index]?.type === "image") {
      startImageTimers();
    }
    return clearTimers;
  }, [index, paused, slides, clearTimers, startImageTimers]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted, index]);

  // Preload images + warm video when approaching video slide
  useEffect(() => {
    slides.forEach((s) => {
      if (s.type === "image") {
        const img = new Image();
        img.decoding = "async";
        img.src = carouselImageUrl(s.src);
      }
      if (s.type === "video") {
        const cover = videoCoverSrc(slides, s);
        if (cover) {
          const img = new Image();
          img.src = cover;
        }
      }
    });
  }, [slides]);

  useEffect(() => {
    if (videoIndex < 0) return;
    // Start fetching video bytes one slide before
    if (index < videoIndex - 1) return;
    const s = slides[videoIndex];
    if (!s || s.type !== "video") return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = carouselVideoUrl(s.src);
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [index, videoIndex, slides]);

  if (!slide || count === 0) return null;

  const showCaption = Boolean(slide.title || slide.body);
  const videoSrc = isVideo ? carouselVideoUrl(slide.src) : undefined;
  const coverSrc = isVideo ? videoCoverSrc(slides, slide) : undefined;

  return (
    <div
      ref={rootRef}
      className="shelf-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
    >
      <div className="shelf-carousel-frame">
        <div className="shelf-carousel-media">
          {slides.map((s, i) => {
            if (s.type !== "image") return null;
            const active = i === index;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.src}
                src={carouselImageUrl(s.src)}
                alt={s.title || ""}
                className="shelf-carousel-slide-img"
                data-active={active ? "true" : "false"}
                decoding="async"
                loading="eager"
                fetchPriority={i === 0 ? "high" : "auto"}
              />
            );
          })}

          {isVideo && coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`cover-${slide.src}`}
              src={coverSrc}
              alt=""
              className="shelf-carousel-video-cover"
              data-blur={coverBlur && !videoReady ? "true" : "false"}
              data-hidden={videoReady ? "true" : "false"}
              decoding="async"
              draggable={false}
            />
          ) : null}

          {isVideo ? (
            <video
              key={slide.src}
              ref={videoRef}
              className="shelf-carousel-slide-video"
              data-ready={videoReady ? "true" : "false"}
              src={videoSrc}
              playsInline
              muted={muted}
              preload="auto"
              disablePictureInPicture
            />
          ) : null}
        </div>

        <div className="shelf-carousel-progress" aria-hidden>
          {slides.map((_, i) => (
            <div key={i} className="shelf-carousel-bar">
              <div
                className="shelf-carousel-bar-fill"
                style={{
                  width:
                    i < index
                      ? "100%"
                      : i === index
                        ? `${progress * 100}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {isVideo ? (
          <button
            type="button"
            className="shelf-carousel-mute"
            onClick={toggleMute}
            aria-label={muted ? labels.unmute : labels.mute}
          >
            {muted ? <MuteIcon /> : <UnmuteIcon />}
          </button>
        ) : null}

        <div className="shelf-carousel-bottom">
          {showCaption ? (
            <div className="shelf-carousel-caption">
              {slide.title ? (
                <p className="shelf-carousel-caption-title">{slide.title}</p>
              ) : null}
              {slide.body ? (
                <p className="shelf-carousel-caption-body">{slide.body}</p>
              ) : null}
            </div>
          ) : null}

          <div className="shelf-carousel-controls">
            <button
              type="button"
              className="shelf-carousel-pause"
              onClick={togglePause}
              aria-label={paused ? labels.play : labels.pause}
              disabled={isVideo && !videoReady}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>

            <div className="shelf-carousel-nav">
              <button
                type="button"
                className={`shelf-carousel-nav-btn prev${index > 0 ? " active" : ""}`}
                onClick={goPrev}
                aria-label={labels.prev}
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                className="shelf-carousel-nav-btn next"
                onClick={goNext}
                aria-label={labels.next}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .shelf-carousel {
          width: min(393px, 100%);
          margin: 0 auto;
          flex-shrink: 0;
        }
        .shelf-carousel-frame {
          position: relative;
          width: 100%;
          height: auto;
          aspect-ratio: 393 / 600;
          border-radius: 40px;
          overflow: hidden;
          background: #111;
          isolation: isolate;
          contain: layout paint;
        }
        .shelf-carousel-media {
          position: absolute;
          inset: 0;
        }
        .shelf-carousel-slide-img,
        .shelf-carousel-slide-video,
        .shelf-carousel-video-cover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .shelf-carousel-slide-img {
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
        }
        .shelf-carousel-slide-img[data-active="true"] {
          opacity: 1;
          z-index: 1;
        }
        .shelf-carousel-video-cover {
          z-index: 3;
          opacity: 1;
          transform: scale(1.02);
          filter: blur(0);
          transition:
            opacity 0.45s ease,
            filter 0.55s ease,
            transform 0.55s ease;
          pointer-events: none;
        }
        .shelf-carousel-video-cover[data-blur="true"] {
          filter: blur(10px);
          transform: scale(1.08);
        }
        .shelf-carousel-video-cover[data-hidden="true"] {
          opacity: 0;
          filter: blur(14px);
          pointer-events: none;
        }
        .shelf-carousel-slide-video {
          z-index: 2;
          opacity: 0;
          transition: opacity 0.35s ease;
          background: #111;
        }
        .shelf-carousel-slide-video[data-ready="true"] {
          opacity: 1;
        }
        .shelf-carousel-progress {
          position: absolute;
          z-index: 5;
          top: 14px;
          left: 14px;
          right: 14px;
          display: flex;
          gap: 5px;
          pointer-events: none;
        }
        .shelf-carousel-bar {
          flex: 1 1 0;
          height: 3px;
          border-radius: 75px;
          background: rgba(255, 255, 255, 0.45);
          overflow: hidden;
        }
        .shelf-carousel-bar-fill {
          height: 100%;
          background: #000;
          border-radius: inherit;
          will-change: width;
        }
        .shelf-carousel-mute {
          position: absolute;
          z-index: 6;
          top: 28px;
          right: 14px;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 50%;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          background: rgba(0, 0, 0, 0.45);
        }
        .shelf-carousel-mute:hover {
          background: rgba(0, 0, 0, 0.58);
        }
        .shelf-carousel-bottom {
          position: absolute;
          z-index: 6;
          left: 14px;
          right: 14px;
          bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .shelf-carousel-caption {
          padding: 16px 18px;
          border-radius: 22px;
          background: #000;
          color: #fff;
        }
        .shelf-carousel-caption-title {
          margin: 0;
          font-family: Roobert, sans-serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .shelf-carousel-caption-body {
          margin: 8px 0 0;
          font-family: Roobert, sans-serif;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.35;
          letter-spacing: -0.01em;
          opacity: 0.92;
        }
        .shelf-carousel-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .shelf-carousel-pause {
          flex: 0 0 auto;
          width: 52px;
          height: 52px;
          border: 0;
          border-radius: 50%;
          background: #000;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }
        .shelf-carousel-pause:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .shelf-carousel-pause:hover:not(:disabled) {
          opacity: 0.85;
        }
        .shelf-carousel-nav {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          height: 52px;
        }
        .shelf-carousel-nav-btn {
          flex: 1 1 0;
          width: auto;
          min-width: 0;
          height: 52px;
          border: 0;
          outline: none;
          box-shadow: none;
          padding: 0;
          border-radius: 75px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          background: transparent;
        }
        .shelf-carousel-nav-btn.prev {
          color: rgba(255, 255, 255, 0.75);
          background: rgba(80, 80, 80, 0.55);
        }
        .shelf-carousel-nav-btn.prev.active {
          color: #fff;
          background: #000;
        }
        .shelf-carousel-nav-btn.next {
          background: #000;
          color: #fff;
        }
        .shelf-carousel-nav-btn:hover {
          opacity: 0.9;
        }
        .shelf-carousel-nav-btn:focus,
        .shelf-carousel-nav-btn:focus-visible {
          outline: none;
        }
        @media (max-width: 759px) {
          .shelf-carousel {
            max-width: min(393px, 100%);
          }
          .shelf-carousel-frame {
            border-radius: 32px;
          }
          .shelf-carousel-caption-title {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
