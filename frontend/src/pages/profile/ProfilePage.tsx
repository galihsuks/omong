import { LogOut } from "lucide-react";
import { BottomNav } from "@/components/common/BottomNav";
import { TopBar } from "@/components/common/TopBar";
import { Button } from "@/components/forms/Button";
import { useAuthStore } from "@/store/auth.store";
import { showToast } from "@/store/toast.store";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <main className="h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 px-4 py-5 text-white">
      <section className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <TopBar title="Profile" subtitle={user?.nama} />

        <div className="flex-1 p-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Email</p>
            <p className="text-base font-semibold text-white">{user?.email}</p>
          </div>

          <div className="mt-4">
            <Button
              variant="model1"
              icon={<LogOut size={16} />}
              onClick={() => {
                logout();
                showToast("success", "Logged out.");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
