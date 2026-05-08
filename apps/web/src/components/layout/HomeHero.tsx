"use client";

import {useTranslations} from "next-intl";

export function HomeHero() {
  const t = useTranslations("home");

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid min-h-[520px] w-full max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">{t("eyebrow")}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{t("description")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white" href="#rfq">
              {t("primaryCta")}
            </a>
            <a className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900" href="#products">
              {t("secondaryCta")}
            </a>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
          <div className="aspect-[4/3] rounded bg-[linear-gradient(135deg,#0f766e_0%,#0f766e_35%,#f8fafc_35%,#f8fafc_58%,#c2410c_58%,#c2410c_100%)]" />
          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-2xl font-bold text-slate-950">10+</dt>
              <dd className="text-xs text-slate-500">{t("stats.categories")}</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-slate-950">3</dt>
              <dd className="text-xs text-slate-500">{t("stats.locales")}</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-slate-950">24h</dt>
              <dd className="text-xs text-slate-500">{t("stats.response")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
