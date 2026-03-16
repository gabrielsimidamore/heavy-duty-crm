import { LayoutDashboard, Users, History, DollarSign, Lightbulb, Megaphone, Settings, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useInteractions } from "@/hooks/useInteractions";
import { cn } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

const navSections = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard",  url: "/",         icon: LayoutDashboard },
      { title: "Clientes",   url: "/clientes", icon: Users },
      { title: "Histórico",  url: "/historico",icon: History },
    ]
  },
  {
    label: "Comercial",
    items: [
      { title: "Vendas",     url: "/vendas",    icon: DollarSign },
      { title: "Projetos",   url: "/projetos",  icon: Lightbulb },
      { title: "Conteúdo",   url: "/conteudo",  icon: Megaphone },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { interactions } = useInteractions();
  const overdue = interactions.filter(i => i.proximaAcao && i.dataPrevista && i.dataPrevista <= today).length;

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ background: "#111111" }}>
      <SidebarContent className="flex flex-col h-full overflow-hidden" style={{ background: "#111111" }}>

        {/* Logo */}
        <div className={cn("flex items-center justify-center border-b shrink-0", collapsed ? "px-3 py-3" : "px-4 py-4")} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Torke 360" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center py-1">
              <img src="/logo.png" alt="Torke 360" style={{ height: "48px", objectFit: "contain", maxWidth: "160px" }} />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-3">
              {!collapsed && (
                <p className="text-[9px] font-semibold uppercase tracking-widest px-4 mb-1" style={{ color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em" }}>
                  {section.label}
                </p>
              )}
              <SidebarMenu className="px-2 space-y-0.5">
                {section.items.map((item) => {
                  const hasBadge = item.url === "/historico" && overdue > 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] font-medium transition-all duration-100",
                            collapsed && "justify-center px-2"
                          )}
                          style={{ color: "rgba(255,255,255,0.45)" }}
                          activeClassName="!bg-primary !text-white"
                        >
                          <div className="relative shrink-0">
                            <item.icon className="h-[15px] w-[15px]" strokeWidth={1.75} />
                            {hasBadge && (
                              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                                {overdue > 9 ? "9+" : overdue}
                              </span>
                            )}
                          </div>
                          {!collapsed && <span className="flex-1">{item.title}</span>}
                          {!collapsed && hasBadge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                              {overdue}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 py-3 px-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <SidebarMenu className="mb-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/configuracoes"
                  className={cn("flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] font-medium transition-all duration-100", collapsed && "justify-center px-2")}
                  style={{ color: "rgba(255,255,255,0.45)" }}
                  activeClassName="!bg-primary !text-white"
                >
                  <Settings className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span>Configurações</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">JP</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>Junior Pinheiro</p>
                <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>Rep. Comercial</p>
              </div>
              <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
