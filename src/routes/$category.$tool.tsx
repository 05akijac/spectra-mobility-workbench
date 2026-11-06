import { createFileRoute, notFound } from "@tanstack/react-router";
import { CATEGORIES, findTool } from "@/lib/tools";
import { TOOL_COMPONENTS } from "@/tools";

export const Route = createFileRoute("/$category/$tool")({
  loader: ({ params }) => {
    const tool = findTool(params.category, params.tool);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.tool;
    const title = t ? `${t.name} — Ion Tools` : "Tool unavailable — Ion Tools";
    const desc = t?.summary ?? "Browser-based mass spectrometry tools.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(t ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const Body = TOOL_COMPONENTS[tool.slug];
  const cat = CATEGORIES.find((c) => c.id === tool.category)?.name;
  return (
    <article>
      <p className="text-xs uppercase tracking-widest text-primary">{cat}</p>
      <h1 className="mt-1 font-serif text-4xl text-foreground">{tool.name}</h1>
      <p className="mt-2 mb-8 text-muted-foreground">{tool.summary}</p>
      {Body && <Body />}
    </article>
  );
}
