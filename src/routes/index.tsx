import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ion Tools — Mass Spectrometry, Ion Mobility & Proteomics calculators" },
      { name: "description", content: "Free browser-based calculators for mass spectrometry, ion mobility and proteomics, with the theory explained." },
      { property: "og:title", content: "Ion Tools — calculators for mass spectrometry" },
      { property: "og:description", content: "Free browser-based calculators for mass spectrometry, ion mobility and proteomics." },
    ],
  }),
  component: Index,
});

function Index() {
  const dev = TOOLS.filter((t) => t.status === "development");
  return (
    <div>
      <h1 className="font-serif text-4xl text-foreground sm:text-5xl">Welcome :)</h1>
      <p className="mt-4 max-w-prose text-lg text-muted-foreground">
        This is a collection of tools for mass spectrometry, ion mobility and proteomics. Everything runs in your browser. Each tool page explains how the tool works, the theory behind it and an example calculation. It also includes links to other websites containing MS tools.


        As I learn more, I will update with more tools, theory and examples
      </p>

      <h2 className="mt-12 font-serif text-2xl text-foreground">Available tools</h2>
      {CATEGORIES.map((c) => {
        const list = TOOLS.filter((t) => t.category === c.id && t.status === "available");
        if (!list.length) return null;
        return (
          <section key={c.id} className="mt-6">
            <h3 className="text-xs uppercase tracking-widest text-primary">{c.name}</h3>
            <ul className="mt-2 divide-y border-y">
              {list.map((t) => (
                <li key={t.slug}>
                  <Link to="/$category/$tool" params={{ category: t.category, tool: t.slug }} className="block py-3 hover:bg-secondary sm:px-2">
                    <span className="font-medium text-foreground">{t.name}</span>
                    <span className="block text-sm text-muted-foreground">{t.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <h2 className="mt-12 font-serif text-2xl text-foreground">In development</h2>
      <ul className="mt-3 list-disc pl-5 text-muted-foreground">
        {dev.map((t) => <li key={t.slug}><span className="text-foreground">{t.name}</span> — {t.summary}</li>)}
      </ul>
    </div>
  );
}
