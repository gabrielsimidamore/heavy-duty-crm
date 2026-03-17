import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText } from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Conteúdo", path: "/conteudo", icon: FileText },
];

export default function AppSidebar() {
  return (
    <aside className="w-64 h-screen bg-black text-white flex flex-col">
      
      {/* LOGO */}
      <div className="p-4 text-lg font-bold border-b border-zinc-800">
        Torke
      </div>

      {/* MENU */}
      <nav className="flex-1 p-2 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
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
