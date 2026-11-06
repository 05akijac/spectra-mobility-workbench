import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES, TOOLS } from "@/lib/tools";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="font-serif text-xl text-foreground">Ion Tools</Link>
        <nav className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <DropdownMenu key={c.id}>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
                {c.name} <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {TOOLS.filter((t) => t.category === c.id).map((t) =>
                  t.status === "available" ? (
                    <DropdownMenuItem key={t.slug} asChild>
                      <Link to="/$category/$tool" params={{ category: t.category, tool: t.slug }}>{t.name}</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={t.slug} asChild>
                      <Link to="/proteomics">{t.name} <span className="ml-auto text-xs text-muted-foreground">coming soon</span></Link>
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
      </div>
    </header>
  );
}
