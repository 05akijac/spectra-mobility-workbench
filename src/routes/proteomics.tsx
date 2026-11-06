import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/proteomics")({
  head: () => ({
    meta: [
      { title: "Proteomics tools (in development) — Ion Tools" },
      { name: "description", content: "Browser-based proteomics tools are in development." },
      { property: "og:title", content: "Proteomics tools — Ion Tools" },
      { property: "og:description", content: "Browser-based proteomics tools are in development." },
    ],
  }),
  component: () => (
    <article>
      <p className="text-xs uppercase tracking-widest text-primary">Proteomics</p>
      <h1 className="mt-1 font-serif text-4xl text-foreground">Coming soon</h1>
      <p className="mt-4 max-w-prose text-muted-foreground">Proteomics tools are in development. Please check back later.</p>
    </article>
  ),
});
