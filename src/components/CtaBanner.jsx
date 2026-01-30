// src/components/CtaBanner.jsx
import React from "react";

export default function CtaBanner({
  title,
  buttonText,
  href = "https://queesia.com/contacto",
  className = "",
  fullWidth = false,
}) {
    const outer = fullWidth ? "w-full px-4" : "max-w-6xl mx-auto px-4";
  return (
     <section className={`w-full ${className}`}>
      <div className={outer}>
        <div className="w-full rounded-3xl bg-sky-200/60 border border-sky-200 shadow-sm px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <h2 className="text-[18px] sm:text-[22px] font-semibold text-slate-900 leading-snug">
              {title}
            </h2>

            <a
              href={href}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition whitespace-nowrap"
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
