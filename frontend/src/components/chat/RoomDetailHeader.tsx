import { Link } from "react-router-dom";
import { LogOut, Menu, Pencil, UserPlus, Users, X, ArrowLeft } from "lucide-react";
import type { RefObject } from "react";
import { TopBar } from "@/components/common/TopBar";

type Props = {
  title: string;
  subtitle?: string;
  isPrivate: boolean;
  showMenu: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  isExitPending?: boolean;
  onToggleMenu: () => void;
  onOpenMembers: () => void;
  onOpenEdit: () => void;
  onOpenAddMembers: () => void;
  onOpenExitConfirm: () => void;
};

export function RoomDetailHeader({
  title,
  subtitle,
  isPrivate,
  showMenu,
  menuRef,
  isExitPending,
  onToggleMenu,
  onOpenMembers,
  onOpenEdit,
  onOpenAddMembers,
  onOpenExitConfirm,
}: Props) {
  return (
    <TopBar
      title={title}
      subtitle={subtitle}
      right={
        <div className="flex gap-2">
          <Link to="/rooms" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
            <ArrowLeft size={16} />
          </Link>
          <div className="relative" ref={menuRef}>
            <button className="rounded-lg bg-white/10 p-2 hover:bg-white/20" onClick={onToggleMenu}>
              {showMenu ? <X size={16} /> : <Menu size={16} />}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 z-20 w-44 rounded-lg border border-white/10 bg-slate-900/60 p-1 shadow-lg backdrop-blur">
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                  onClick={onOpenMembers}
                >
                  <Users size={14} /> Members
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                  onClick={onOpenEdit}
                >
                  <Pencil size={14} /> Edit
                </button>
                {!isPrivate && (
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
                    onClick={onOpenAddMembers}
                  >
                    <UserPlus size={14} /> Add Member
                  </button>
                )}
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-300 hover:bg-white/10 disabled:opacity-60"
                  onClick={onOpenExitConfirm}
                  disabled={isExitPending}
                >
                  <LogOut size={14} /> Exit
                </button>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
