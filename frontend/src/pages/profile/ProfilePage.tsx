import { useEffect, useMemo, useState } from "react";
import { LogOut, Mail, Shield, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/common/BottomNav";
import { TopBar } from "@/components/common/TopBar";
import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/InputField";
import { logoutApi } from "@/api/auth.api";
import { useMyProfileQuery, useUpdateMyProfileMutation } from "@/hooks/useUser";
import { useAuthStore } from "@/store/auth.store";
import { showToast } from "@/store/toast.store";
import { formatDateTimeByTimeZone } from "@/utils/dateTime";
import { useOnlineMembersStore } from "@/store/onlineMembers.store";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const isOnlineById = useOnlineMembersStore((state) => state.isOnlineById);
  const getLastSeenById = useOnlineMembersStore((state) => state.getLastSeenById);
  const { data: profileData, isPending: isProfilePending } = useMyProfileQuery();
  const { mutate: updateProfile, isPending: isUpdatePending } = useUpdateMyProfileMutation();
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    sandi: "",
    timezone: "UTC",
  });

  useEffect(() => {
    if (!profileData) return;
    setForm({
      nama: profileData.nama ?? "",
      email: profileData.email ?? "",
      sandi: "",
      timezone: profileData.timezone ?? "UTC",
    });
  }, [profileData]);

  const createdAtLabel = useMemo(() => {
    if (!profileData?.createdAt) return "-";
    return formatDateTimeByTimeZone(profileData.createdAt, form.timezone);
  }, [form.timezone, profileData?.createdAt]);

  const updatedAtLabel = useMemo(() => {
    if (!profileData?.updatedAt) return "-";
    return formatDateTimeByTimeZone(profileData.updatedAt, form.timezone);
  }, [form.timezone, profileData?.updatedAt]);

  const isRealtimeOnline = isOnlineById(user?.id);
  const lastSeen = getLastSeenById(user?.id);
  const onlineLabel = isRealtimeOnline
    ? "Online"
    : lastSeen
      ? `Last seen ${formatDateTimeByTimeZone(lastSeen, form.timezone)}`
      : "Offline";

  const handleSave = () => {
    const payload: { nama?: string; email?: string; sandi?: string; timezone?: string } = {};

    const nextNama = form.nama.trim();
    const nextEmail = form.email.trim();
    const nextSandi = form.sandi.trim();
    const nextTimeZone = form.timezone.trim();

    if (nextNama && nextNama !== profileData?.nama) payload.nama = nextNama;
    if (nextEmail && nextEmail !== profileData?.email) payload.email = nextEmail;
    if (nextSandi) payload.sandi = nextSandi;
    if (nextTimeZone && nextTimeZone !== profileData?.timezone) payload.timezone = nextTimeZone;

    if (!payload.nama && !payload.email && !payload.sandi && !payload.timezone) {
      showToast("warning", "No changes to save.");
      return;
    }

    updateProfile(payload, {
      onSuccess: (updated) => {
        queryClient.invalidateQueries({ queryKey: ["my-profile"] });
        if (user) {
          setUser({
            ...user,
            nama: updated.nama,
            email: updated.email,
          });
        }
        setForm((prev) => ({ ...prev, sandi: "" }));
        showToast("success", "Profile updated successfully.");
      },
      onError: (error) => showToast("error", (error as Error).message),
    });
  };

  return (
    <main className="h-svh bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-white">
      <section className="mx-auto flex h-full w-full max-w-3xl flex-col">
        <TopBar title="Profile" subtitle={user?.nama} />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">User ID</p>
            <p className="mb-3 truncate text-sm font-medium">{profileData?._id ?? "-"}</p>

            <div className="space-y-3">
              <InputField
                label="Name"
                leftIcon={<User size={16} />}
                value={form.nama}
                onChange={(event) => setForm((prev) => ({ ...prev, nama: event.target.value }))}
                placeholder={isProfilePending ? "Loading..." : "Your name"}
                disabled={isProfilePending || isUpdatePending}
              />
              <InputField
                label="Email"
                type="email"
                leftIcon={<Mail size={16} />}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder={isProfilePending ? "Loading..." : "you@example.com"}
                disabled={isProfilePending || isUpdatePending}
              />
              <InputField
                label="New Password (Optional)"
                type="password"
                leftIcon={<Shield size={16} />}
                value={form.sandi}
                onChange={(event) => setForm((prev) => ({ ...prev, sandi: event.target.value }))}
                placeholder="Leave empty if no change"
                disabled={isProfilePending || isUpdatePending}
              />
              <InputField
                label="Timezone (IANA)"
                value={form.timezone}
                onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
                placeholder="Example: Asia/Jakarta or UTC"
                disabled={isProfilePending || isUpdatePending}
              />
            </div>

            <div className="mt-4 grid gap-2 text-xs text-slate-300">
              <p>
                Status:{" "}
                <span className={onlineLabel === "Online" ? "font-semibold" : ""}>
                  {onlineLabel}
                </span>
              </p>
              <p>Timezone: {form.timezone || "UTC"}</p>
              <p>Joined at: {createdAtLabel}</p>
              <p>Updated at: {updatedAtLabel}</p>
            </div>

            <div className="mt-4">
              <Button
                variant="model1"
                onClick={handleSave}
                disabled={isProfilePending || isUpdatePending}
              >
                {isUpdatePending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="model1"
              icon={<LogOut size={16} />}
              disabled={isLogoutPending}
              onClick={async () => {
                if (isLogoutPending) return;
                setIsLogoutPending(true);
                try {
                  await logoutApi();
                } catch {
                  // Continue local logout and redirect even if request fails.
                } finally {
                  logout();
                  window.location.assign("/login");
                }
              }}
            >
              {isLogoutPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <BottomNav />
      </section>
    </main>
  );
}
