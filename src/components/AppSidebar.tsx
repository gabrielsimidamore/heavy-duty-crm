import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText } from "lucide-react";

export default function AppSidebar() {
  const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Conteúdo", path: "/conteudo", icon: FileText },
  ];

  return (
    <aside className="w-64 h-screen bg-black text-white flex flex-col">
      
      {/* LOGO */}
      <div className="h-16 flex items-center px-4 border-b border-zinc-800">
        <span className="text-lg font-bold">Torke</span>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
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

          <div>
            <p className="text-sm font-medium">Junior Pinheiro</p>
            <p className="text-xs text-gray-400">Rep. Comercial</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
