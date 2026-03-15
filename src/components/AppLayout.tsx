import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Search, Bell, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { useInteractions } from "@/hooks/useInteractions";
import { useProjects } from "@/hooks/useProjects";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { projects } = useProjects();

  const today = new Date().toISOString().slice(0, 10);
  const overdueCount = interactions.filter(i => i.proximaAcao && i.dataPrevista && i.dataPrevista <= today).length;

  const typeColors: Record<string, string> = {
    "Cliente": "text-blue-400 bg-blue-400/10",
    "Interação": "text-amber-400 bg-amber-400/10",
    "Projeto": "text-emerald-400 bg-emerald-400/10",
  };

  const searchResults = globalSearch.length >= 2 ? [
    ...clients.filter(c =>
      c.contato.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.empresa.toLowerCase().includes(globalSearch.toLowerCase())
    ).slice(0, 3).map(c => ({ type: "Cliente", label: c.contato, sub: c.empresa, url: "/clientes" })),
    ...interactions.filter(i =>
      i.summary.toLowerCase().includes(globalSearch.toLowerCase()) ||
      i.empresa.toLowerCase().includes(globalSearch.toLowerCase())
    ).slice(0, 3).map(i => ({ type: "Interação", label: i.empresa, sub: i.summary.slice(0, 50) + "...", url: "/historico" })),
    ...projects.filter(p =>
      p.nome.toLowerCase().includes(globalSearch.toLowerCase())
    ).slice(0, 2).map(p => ({ type: "Projeto", label: p.nome, sub: p.clientName || "", url: "/projetos" })),
  ] : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); document.getElementById("global-search")?.focus(); }
      if (e.key === "Escape") { setShowResults(false); setGlobalSearch(""); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-13 flex items-center header-surface px-4 gap-4 z-20 sticky top-0" style={{ height: "52px" }}>
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.04]" />

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="global-search"
                  placeholder="Buscar clientes, interações, projetos..."
                  value={globalSearch}
                  onChange={e => { setGlobalSearch(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="pl-9 pr-16 h-8 text-xs bg-white/[0.04] border-border/60 focus:border-primary/30 focus:bg-white/[0.06] transition-all rounded-lg placeholder:text-muted-foreground/50"
                />
                <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
                  <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] text-muted-foreground/50 bg-white/[0.04] border border-border/40 rounded">
                    <Command className="h-2 w-2" />K
                  </kbd>
                </div>
              </div>

              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 right-0 card-elevated rounded-xl z-50 overflow-hidden py-1 shadow-2xl"
                  >
                    {searchResults.map((r, idx) => (
                      <button key={idx}
                        className="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition-colors flex items-center gap-3"
                        onMouseDown={() => { navigate(r.url); setGlobalSearch(""); setShowResults(false); }}
                      >
                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded font-display ${typeColors[r.type] || "text-muted-foreground bg-muted"}`}>{r.type}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{r.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{r.sub}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-2">
              {overdueCount > 0 && (
                <button
                  onClick={() => navigate("/historico")}
                  className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-medium hover:bg-destructive/15 transition-colors"
                >
                  <Bell className="h-3 w-3" />
                  {overdueCount} ação{overdueCount > 1 ? "ões" : ""} atrasada{overdueCount > 1 ? "s" : ""}
                </button>
              )}
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
                <span className="text-[10px] font-bold text-primary font-display">JP</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto scroll-area">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
