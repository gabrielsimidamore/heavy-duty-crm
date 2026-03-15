import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Search, Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { useInteractions } from "@/hooks/useInteractions";
import { useProjects } from "@/hooks/useProjects";
import { motion, AnimatePresence } from "framer-motion";

const typeColor: Record<string, string> = {
  "Cliente":   "bg-blue-50 text-blue-700 border border-blue-200",
  "Interação": "bg-amber-50 text-amber-700 border border-amber-200",
  "Projeto":   "bg-green-50 text-green-700 border border-green-200",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { projects } = useProjects();

  const today = new Date().toISOString().slice(0, 10);
  const overdue = interactions.filter(i => i.proximaAcao && i.dataPrevista && i.dataPrevista <= today).length;

  const results = search.length >= 2 ? [
    ...clients.filter(c =>
      c.contato.toLowerCase().includes(search.toLowerCase()) ||
      c.empresa.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 3).map(c => ({ type: "Cliente", label: c.contato, sub: c.empresa, url: "/clientes" })),
    ...interactions.filter(i =>
      i.summary.toLowerCase().includes(search.toLowerCase()) ||
      i.empresa.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 2).map(i => ({ type: "Interação", label: i.empresa, sub: i.summary.slice(0, 55) + "...", url: "/historico" })),
    ...projects.filter(p =>
      p.nome.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 2).map(p => ({ type: "Projeto", label: p.nome, sub: p.clientName || "—", url: "/projetos" })),
  ] : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-[52px] flex items-center header-bg px-4 gap-3 z-20 sticky top-0">
            <SidebarTrigger className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-all" />

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-8 px-3 rounded border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all text-[13px] flex-1 max-w-xs"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">Buscar...</span>
              <span className="text-[10px] font-medium border border-border px-1.5 py-0.5 rounded text-muted-foreground/60">⌘K</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              {overdue > 0 && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => navigate("/historico")}
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded text-[11px] font-semibold hover:opacity-80 transition-opacity"
                  style={{ background: "#FFEBE6", color: "#BF2600", border: "1px solid #FFBDAD" }}
                >
                  <Bell className="h-3 w-3" />
                  {overdue} atrasada{overdue > 1 ? "s" : ""}
                </motion.button>
              )}
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                <span className="text-[10px] font-bold text-white">JP</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Search modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => { setOpen(false); setSearch(""); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar clientes, interações, projetos..."
                  className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button onClick={() => { setOpen(false); setSearch(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {results.length > 0 ? (
                <div className="py-1.5 max-h-72 overflow-y-auto">
                  {results.map((r, idx) => (
                    <button key={idx}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                      onClick={() => { navigate(r.url); setOpen(false); setSearch(""); }}
                    >
                      <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${typeColor[r.type] || ""}`}>{r.type}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{r.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{r.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : search.length >= 2 ? (
                <p className="px-4 py-6 text-[13px] text-muted-foreground text-center">Nenhum resultado encontrado</p>
              ) : (
                <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">Digite para buscar...</p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SidebarProvider>
  );
}
