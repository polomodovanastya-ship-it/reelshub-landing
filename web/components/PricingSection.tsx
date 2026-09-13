"use client";

import { useMemo, useState } from "react";
import type { Section } from "@/lib/directus";

type Plan = {
  name: string;
  price: number;
  from?: boolean;
  featured?: boolean;
  badge?: string;
  features: string[];
};

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU").replace(/\u00a0/g, " ") + " ₽";
}

export function PricingSection({ section }: { section: Section }) {
  const [annual, setAnnual] = useState(false);
  const discount = section.annual_discount ?? 0.8;
  const plans = (section.items?.plans as Plan[]) || [];

  const period = annual ? "в месяц при оплате за год" : "в месяц";

  const priced = useMemo(
    () =>
      plans.map((p) => {
        const value = annual ? Math.round(p.price * discount) : p.price;
        const label = (p.from ? "от " : "") + formatPrice(value);
        return { ...p, label };
      }),
    [plans, annual, discount]
  );

  return (
    <section id={section.anchor || "pricing"} className="section container">
      <div className="pricing-head">
        <h2 className="h2">{section.title}</h2>
        <div className="toggle">
          <button
            type="button"
            className={!annual ? "active" : ""}
            onClick={() => setAnnual(false)}
          >
            Месяц
          </button>
          <button
            type="button"
            className={annual ? "active" : ""}
            onClick={() => setAnnual(true)}
          >
            Год
          </button>
        </div>
      </div>
      <div className="plans">
        {priced.map((p) => (
          <div
            key={p.name}
            className={`plan ${p.featured ? "featured" : ""}`}
          >
            <div className="plan-name">
              <span>{p.name}</span>
              {p.badge ? <span className="plan-badge">{p.badge}</span> : null}
            </div>
            <div className="plan-price">{p.label}</div>
            <div className="plan-period">{period}</div>
            <div className="plan-features">
              {p.features.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <a href="#contact" className="btn btn-outline">
              Выбрать
            </a>
          </div>
        ))}
      </div>
      <style jsx>{`
        .section {
          flex-direction: column;
          justify-content: center;
          align-items: stretch;
        }
        .pricing-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          width: 100%;
          margin: 0 0 34px;
        }
        .toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border: 1px solid #000;
          border-radius: 75px;
        }
        .toggle button {
          display: inline-flex;
          align-items: center;
          padding: 9px 22px;
          border: 0;
          border-radius: 75px;
          background: transparent;
          color: #000;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
          cursor: pointer;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .toggle button.active {
          background: #181818;
          color: #fff;
        }
        .plans {
          display: flex;
          align-items: stretch;
          gap: 48px;
          width: 100%;
        }
        .plan {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 22px;
          border-top: 1px solid #000;
        }
        .plan.featured {
          border-top-color: #2ece8a;
        }
        .plan-name {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 24px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .plan-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 75px;
          background: linear-gradient(75deg, #0ffbc0, #2ece8a);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .plan-price {
          font-size: clamp(30px, 3.4vw, 44px);
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .plan-period {
          font-size: 14px;
          font-weight: 300;
          color: #6d6d6d;
        }
        .plan-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 16px;
          font-weight: 300;
          line-height: 1.3;
          color: #181818;
        }
        .plan :global(.btn) {
          margin-top: auto;
          align-self: flex-start;
        }
        @media (max-width: 759px) {
          .pricing-head {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
            margin-bottom: 22px;
          }
          .plans {
            flex-direction: column;
            gap: 34px;
          }
        }
      `}</style>
    </section>
  );
}
