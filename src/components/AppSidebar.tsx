import { LayoutDashboard, Users, History, DollarSign, Lightbulb, Settings } from "lucide-react";
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

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Vendas", url: "/vendas", icon: DollarSign },
  { title: "Projetos", url: "/projetos", icon: Lightbulb },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
                      <item.icon className="mr-2 h-4 w-4" />
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
