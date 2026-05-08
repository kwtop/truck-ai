import {HomeHero} from "@/components/layout/HomeHero";
import {defaultLocale, getMessages, isLocale} from "@/lib/i18n/locales";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({params}: HomePageProps) {
  const {locale} = await params;
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const messages = getMessages(safeLocale);

  return (
    <main>
      <HomeHero />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
        {messages.home.highlights.map((item) => (
          <article key={item.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{item.label}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
