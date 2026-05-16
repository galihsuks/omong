import { MessageCircle, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNav() {
  const { pathname } = useLocation();

  const items = [
    { label: "Rooms", to: "/rooms", icon: MessageCircle },
    { label: "Profile", to: "/profile", icon: UserRound },
  ];

  return (
    <nav className="px-6 pb-4">
      <div className="border-t border-white/10 pt-4">
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition ${
                    active
                      ? "text-indigo-400 font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
