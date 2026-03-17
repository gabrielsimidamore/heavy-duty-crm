import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Conteúdo",
    url: "/conteudo",
    icon: FileText,
  },
];

export default function AppSidebar({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "h-screen bg-black text-white flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* LOGO */}
      <div className="p-4 text-lg font-bold">
        {!collapsed ? "Torke" : "T"}
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-zinc-800"
                )
              }
            >
              <Icon size={18} />

              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* USER */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            JP
          </div>

          {!collapsed && (
            <div>
              <p className="text-sm font-medium">Junior Pinheiro</p>
              <p className="text-xs text-gray-400">Rep. Comercial</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
