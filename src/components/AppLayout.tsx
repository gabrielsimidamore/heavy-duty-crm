import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clients } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { projects } from "@/data/projects";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const searchResults = globalSearch.length >= 2 ? [
    ...clients
      .filter(c => c.contato.toLowerCase().includes(globalSearch.toLowerCase()) || c.empresa.toLowerCase().includes(globalSearch.toLowerCase()))
      .slice(0, 3)
      .map(c => ({ type: "Cliente" as const, label: `${c.contato} — ${c.empresa}`, url: "/clientes" })),
    ...interactions
      .filter(i => i.summary.toLowerCase().includes(globalSearch.toLowerCase()) || i.empresa.toLowerCase().includes(globalSearch.toLowerCase()))
      .slice(0, 3)
      .map(i => ({ type: "Interação" as const, label: `${i.empresa} — ${i.summary.slice(0, 60)}...`, url: "/historico" })),
    ...projects
      .filter(p => p.nome.toLowerCase().includes(globalSearch.toLowerCase()))
      .slice(0, 3)
      .map(p => ({ type: "Projeto" as const, label: p.nome, url: "/projetos" })),
  ] : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResults(false);
        setGlobalSearch("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full top-accent">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center glass-bar px-4 gap-4 z-10 sticky top-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <span className="font-display text-xs tracking-widest uppercase text-muted-foreground hidden sm:inline">
              Linha Autopeças — Linha Médio Pesado
            </span>
            <div className="relative ml-auto w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Busca global..."
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="pl-9 h-8 text-xs bg-transparent border-border/50 focus:border-primary/40 transition-all"
              />
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full mt-2 left-0 right-0 glass-elevated rounded-2xl z-50 max-h-64 overflow-auto p-1"
                  >
                    {searchResults.map((r, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-foreground/5 transition-colors flex items-center gap-2 rounded-xl"
                        onMouseDown={() => { navigate(r.url); setGlobalSearch(""); setShowResults(false); }}
                      >
                        <span className="text-[10px] font-display uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{r.type}</span>
                        <span className="text-foreground truncate">{r.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
