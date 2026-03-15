import { LayoutDashboard, Users, History, DollarSign, Lightbulb, Megaphone, Settings, AlertCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useInteractions } from "@/hooks/useInteractions";

const today = new Date().toISOString().slice(0, 10);

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { interactions } = useInteractions();

  const overdueCount = interactions.filter(
    i => i.proximaAcao && i.dataPrevista && i.dataPrevista <= today
  ).length;

  const items = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, badge: 0 },
    { title: "Clientes", url: "/clientes", icon: Users, badge: 0 },
    { title: "Histórico", url: "/historico", icon: History, badge: overdueCount },
    { title: "Vendas", url: "/vendas", icon: DollarSign, badge: 0 },
    { title: "Projetos", url: "/projetos", icon: Lightbulb, badge: 0 },
    { title: "Conteúdo", url: "/conteudo", icon: Megaphone, badge: 0 },
    { title: "Configurações", url: "/configuracoes", icon: Settings, badge: 0 },
  ];

  return (
    <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
      <SidebarContent>
        <div className="p-4">
          {!collapsed && (
            <h2 className="font-display text-sm font-bold tracking-wider text-primary uppercase">
              CRM Junior Pinheiro
            </h2>
          )}
          {collapsed && (
            <span className="font-display text-lg font-bold text-primary">JP</span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-xs tracking-widest uppercase text-muted-foreground">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-foreground/5 rounded-xl transition-all duration-200"
                      activeClassName="glass-subtle text-primary font-medium"
                    >
                      <div className="relative mr-2">
                        <item.icon className="h-4 w-4" />
                        {item.badge > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
