"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-2 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:px-8">
      {items.map((item, index) => {
        const isOpen = index === openIndex;

        return (
          <div
            key={item.question}
            className="border-b border-slate-200 last:border-b-0"
          >
            <button
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span
                className={`text-base leading-7 font-semibold transition ${
                  isOpen ? "text-slate-950" : "text-slate-700"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`text-3xl leading-none text-[var(--trust)] transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-70"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-6 text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
