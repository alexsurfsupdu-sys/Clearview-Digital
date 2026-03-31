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
    <div>
      {items.map((item, index) => {
        const isOpen = index === openIndex;

        return (
          <div
            key={item.question}
            className="border-b border-white/8 last:border-b-0"
          >
            <button
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span
                className={`text-base leading-7 font-medium transition ${
                  isOpen ? "text-white" : "text-white/72"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`text-3xl leading-none text-[var(--accent)] transition-transform ${
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
                <p className="pb-6 pr-6 text-sm leading-7 text-white/46">
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
