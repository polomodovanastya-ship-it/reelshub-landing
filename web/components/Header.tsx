"use client";

import { useState } from "react";
import type { NavLink } from "@/lib/directus";

export function Header({
  links,
  logoSrc = "/media/reelshub-logo-3.png",
}: {
  links: NavLink[];
  logoSrc?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <button
        type="button"
        className="burger"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>
      <a href="#top" className="logo">
        <img src={logoSrc} alt="reelshub" height={29} />
      </a>
      <nav className={`nav ${open ? "open" : ""}`}>
        {links.map((l) => (
          <a key={l.href + l.label} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
      <style jsx>{`
        .site-header {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 1140px;
          height: 48px;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 0 30px;
          background: #181818;
          border-radius: 75px;
          color: #fff;
        }
        .logo {
          display: flex;
          align-items: center;
          margin-right: auto;
          transition: opacity 0.4s ease;
        }
        .logo img {
          height: 29px;
          width: auto;
          display: block;
        }
        .nav {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.9vw, 28px);
          white-space: nowrap;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          width: 22px;
          padding: 0;
          border: 0;
          background: none;
          color: inherit;
          cursor: pointer;
        }
        .burger span {
          display: block;
          width: 18px;
          height: 1px;
          background: currentColor;
        }
        @media (max-width: 759px) {
          .site-header {
            top: 8px;
            width: calc(100% - 20px);
            max-width: 430px;
            padding: 0 18px;
            height: 42px;
          }
          .burger {
            display: flex;
            order: 2;
            margin-left: auto;
          }
          .logo {
            order: 1;
            margin-right: 0;
          }
          .logo img {
            height: 25px;
          }
          .nav {
            display: none;
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 18px 20px;
            background: #181818;
            border-radius: 18px;
          }
          .nav.open {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
