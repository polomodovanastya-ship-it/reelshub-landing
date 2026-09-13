"use client";

import { FormEvent, useState } from "react";
import type { Section } from "@/lib/directus";
import { submitLead } from "@/lib/directus";

export function ContactSection({ section }: { section: Section }) {
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const items = (section.items || {}) as {
    contact_label?: string;
    contact_placeholder?: string;
    consent_text?: string;
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contact.trim() || !consent) return;
    setState("loading");
    try {
      await submitLead({ contact: contact.trim(), consent });
      setState("ok");
      setContact("");
      setConsent(false);
    } catch {
      setState("err");
    }
  }

  return (
    <section id={section.anchor || "contact"} className="section container">
      <h2 className="h2">{section.title}</h2>
      {section.body ? <p className="lead" style={{ marginTop: 16 }}>{section.body}</p> : null}
      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>{items.contact_label || "Telegram или email"}</span>
          <input
            type="text"
            placeholder={items.contact_placeholder || "@username"}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn" disabled={state === "loading"}>
          {state === "loading" ? "Отправка…" : section.cta_label || "Отправить"}
        </button>
        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
          />
          <span>
            Я согласен с{" "}
            <a href="/policy.pdf" target="_blank" rel="noopener noreferrer">
              Политикой обработки персональных данных
            </a>
          </span>
        </label>
        {state === "ok" ? <p className="msg ok">Спасибо! Напишем в течение дня.</p> : null}
        {state === "err" ? <p className="msg err">Не удалось отправить. Попробуйте ещё раз.</p> : null}
      </form>
      <style jsx>{`
        .section {
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .form {
          margin-top: 52px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 32px;
          width: 100%;
          max-width: 900px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        label span {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6d6d6d;
        }
        input[type="text"] {
          width: 100%;
          padding: 12px 0;
          border: 0;
          border-bottom: 1px solid #000;
          border-radius: 0;
          background: transparent;
          font-family: inherit;
          font-size: 18px;
          font-weight: 300;
          color: #000;
          outline: none;
        }
        .consent {
          width: 100%;
          flex-direction: row;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }
        .consent span {
          text-transform: none;
          letter-spacing: -0.01em;
          font-size: 12px;
          font-weight: 300;
          line-height: 1.35;
          color: #6d6d6d;
        }
        .consent a {
          border-bottom: 1px solid #6d6d6d;
        }
        .consent a:hover {
          opacity: 0.6;
        }
        .consent input {
          width: 16px;
          height: 16px;
          margin: 2px 0 0;
          flex: 0 0 16px;
          accent-color: #2ece8a;
        }
        .msg {
          width: 100%;
          margin: 0;
          font-size: 15px;
          font-weight: 300;
        }
        .ok {
          color: #17845a;
        }
        .err {
          color: #b3121c;
        }
        .form :global(.btn) {
          align-self: flex-start;
        }
        @media (max-width: 759px) {
          .form {
            margin-top: 32px;
            gap: 24px;
          }
          .form :global(.btn) {
            width: 100%;
            align-self: stretch;
          }
        }
      `}</style>
    </section>
  );
}
