import katex from "katex";
import type { ReactNode } from "react";

export function TeX({ children, block }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { displayMode: !!block, throwOnError: false });
  return block ? (
    <div className="my-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function Field({
  label, unit, value, onChange, step = "any",
}: { label: string; unit?: string; value: number; onChange: (v: number) => void; step?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full bg-transparent px-3 py-2 font-mono outline-none"
        />
        {unit && <span className="px-3 text-xs text-muted-foreground whitespace-nowrap">{unit}</span>}
      </span>
    </label>
  );
}

export function Calculator({ inputs, results }: { inputs: ReactNode; results: [string, string][] }) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">{inputs}</div>
      <dl className="mt-6 divide-y rounded-md bg-secondary px-4">
        {results.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-mono font-medium text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      <div className="prose-sci mt-3 space-y-3 text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}
