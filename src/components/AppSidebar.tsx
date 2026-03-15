import { LayoutDashboard, Users, History, DollarSign, Lightbulb, Megaphone, Settings, AlertCircle, Truck, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useInteractions } from "@/hooks/useInteractions";

const today = new Date().toISOString().slice(0, 10);

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Vendas", url: "/vendas", icon: DollarSign },
  { title: "Projetos", url: "/projetos", icon: Lightbulb },
  { title: "Conteúdo", url: "/conteudo", icon: Megaphone },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { interactions } = useInteractions();
  const overdueCount = interactions.filter(i => i.proximaAcao && i.dataPrevista && i.dataPrevista <= today).length;

  return (
    <Sidebar collapsible="icon" className="sidebar-surface border-r-0">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border/50 ${collapsed ? "justify-center px-3" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Truck className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-[11px] font-semibold text-foreground font-display leading-tight">CRM Junior Pinheiro</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-tight mt-0.5">Autopeças · Médio Pesado</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <SidebarGroup className="flex-1 py-3">
          {!collapsed && (
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-4 mb-2">Menu</p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {navItems.map((item) => {
                const isBadged = item.url === "/historico" && overdueCount > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
                        activeClassName="bg-primary/10 text-primary hover:bg-primary/12 hover:text-primary font-medium"
                      >
                        <div className="relative shrink-0">
                          <item.icon className="h-4 w-4" />
                          {isBadged && (
                            <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                              {overdueCount > 9 ? "9+" : overdueCount}
                            </span>
                          )}
                        </div>
                        {!collapsed && <span className="flex-1 font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom */}
        <div className="px-2 pb-4 border-t border-border/50 pt-3 space-y-0.5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/configuracoes"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
                  activeClassName="bg-primary/10 text-primary hover:bg-primary/12 hover:text-primary font-medium"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="font-medium">Configurações</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg bg-white/[0.03] border border-border/50">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary font-display">JP</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">Junior Pinheiro</p>
                <p className="text-[9px] text-muted-foreground truncate">Representante Comercial</p>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
