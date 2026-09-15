"use client";

import { useEffect, useRef, useState } from "react";
import {
  resolveMediaUrl,
  type CarouselSlide,
} from "@/lib/shelves-carousel";

export type { CarouselSlide };

const IMAGE_DURATION_MS = 5000;

function resolveSrc(src: string) {
  return resolveMediaUrl(src);
}

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

export function ShelfCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const accruedRef = useRef<number>(0);

  const count = slides.length;
  const slide = slides[index];
  const isVideo = slide?.type === "video";

  const goTo = (next: number) => {
    const i = ((next % count) + count) % count;
    setIndex(i);
    setProgress(0);
    accruedRef.current = 0;
    startedAtRef.current = performance.now();
  };

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const togglePause = () => {
    setPaused((p) => {
      const nextPaused = !p;
      const video = videoRef.current;
      if (isVideo && video) {
        if (nextPaused) video.pause();
        else void video.play().catch(() => {});
      }
      if (!nextPaused) {
        startedAtRef.current = performance.now();
      } else {
        accruedRef.current += performance.now() - startedAtRef.current;
      }
      return nextPaused;
    });
  };

  // Reset / autoplay when slide changes
  useEffect(() => {
    setProgress(0);
    accruedRef.current = 0;
    startedAtRef.current = performance.now();

    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    if (!paused && isVideo) {
      void video.play().catch(() => setPaused(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on index/isVideo
  }, [index, isVideo]);

  // Progress + auto-advance for images; video drives its own progress
  useEffect(() => {
    if (paused || !slide) return;

    if (isVideo) {
      const video = videoRef.current;
      if (!video) return;

      const onTime = () => {
        if (!video.duration || !Number.isFinite(video.duration)) return;
        setProgress(Math.min(1, video.currentTime / video.duration));
      };
      const onEnded = () => next();

      video.addEventListener("timeupdate", onTime);
      video.addEventListener("ended", onEnded);
      return () => {
        video.removeEventListener("timeupdate", onTime);
        video.removeEventListener("ended", onEnded);
      };
    }

    const tick = (now: number) => {
      const elapsed = accruedRef.current + (now - startedAtRef.current);
      const p = Math.min(1, elapsed / IMAGE_DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        next();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    startedAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // next is stable enough via index closure; intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, isVideo, slide]);

  if (!slide || count === 0) return null;

  const src = resolveSrc(slide.src);
  const poster = slide.poster ? resolveSrc(slide.poster) : undefined;
  const showCaption = Boolean(slide.title || slide.body);

  return (
    <div className="shelf-carousel" role="region" aria-roledescription="carousel" aria-label="Полки роликов">
      <div className="shelf-carousel-frame">
        <div className="shelf-carousel-media">
          {isVideo ? (
            <video
              key={slide.src}
              ref={videoRef}
              src={src}
              poster={poster}
              playsInline
              muted
              loop={false}
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={slide.src} src={src} alt={slide.title || ""} />
          )}
        </div>

        <div className="shelf-carousel-progress" aria-hidden>
          {slides.map((_, i) => (
            <div key={i} className="shelf-carousel-bar">
              <div
                className="shelf-carousel-bar-fill"
                style={{
                  width:
                    i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="shelf-carousel-bottom">
          {showCaption ? (
            <div className="shelf-carousel-caption">
              {slide.title ? <p className="shelf-carousel-caption-title">{slide.title}</p> : null}
              {slide.body ? <p className="shelf-carousel-caption-body">{slide.body}</p> : null}
            </div>
          ) : null}

          <div className="shelf-carousel-controls">
            <button
              type="button"
              className="shelf-carousel-pause"
              onClick={togglePause}
              aria-label={paused ? "Воспроизвести" : "Пауза"}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>

            <div className="shelf-carousel-nav">
              <button type="button" className="shelf-carousel-nav-btn prev" onClick={prev} aria-label="Назад">
                <ChevronLeft />
              </button>
              <button type="button" className="shelf-carousel-nav-btn next" onClick={next} aria-label="Вперёд">
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
        }
        .shelf-carousel-media {
          position: absolute;
          inset: 0;
        }
        .shelf-carousel-media img,
        .shelf-carousel-media video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .shelf-carousel-progress {
          position: absolute;
          z-index: 2;
          top: 14px;
          left: 14px;
          right: 14px;
          display: flex;
          gap: 5px;
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
          transition: width 0.05s linear;
        }
        .shelf-carousel-bottom {
          position: absolute;
          z-index: 2;
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
          gap: 12px;
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
        .shelf-carousel-pause:hover {
          opacity: 0.85;
        }
        .shelf-carousel-nav {
          display: flex;
          height: 52px;
          border-radius: 75px;
          overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          background: rgba(40, 40, 40, 0.55);
          backdrop-filter: blur(8px);
        }
        .shelf-carousel-nav-btn {
          width: 64px;
          height: 100%;
          border: 0;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          background: transparent;
        }
        .shelf-carousel-nav-btn.prev {
          color: rgba(255, 255, 255, 0.75);
          background: rgba(60, 60, 60, 0.35);
        }
        .shelf-carousel-nav-btn.next {
          background: #000;
          color: #fff;
        }
        .shelf-carousel-nav-btn:hover {
          opacity: 0.9;
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
