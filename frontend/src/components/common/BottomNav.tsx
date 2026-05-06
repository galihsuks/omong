import { MessageCircle, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNav() {
  const { pathname } = useLocation();

  const items = [
    { label: "Rooms", to: "/rooms", icon: MessageCircle },
    { label: "Profile", to: "/profile", icon: UserRound },
  ];

  return (
    <nav className="border-t border-white/10 px-3 py-2">
      <ul className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition ${
                  active
                    ? "bg-indigo-400/30 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
