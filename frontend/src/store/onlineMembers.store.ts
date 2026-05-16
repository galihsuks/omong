import { create } from "zustand";
import { getOnlineUsersApi, type OnlineUser } from "@/api/user.api";

type OnlineMembersState = {
  members: OnlineUser[];
  syncFromOnlineIds: (onlineIds: string[]) => Promise<void>;
  isOnlineById: (userId?: string | null) => boolean;
  getLastSeenById: (userId?: string | null) => string | null;
};

export const useOnlineMembersStore = create<OnlineMembersState>((set, get) => ({
  members: [],
  syncFromOnlineIds: async (onlineIds) => {
    const now = new Date().toISOString();
    const current = get().members;
    const currentMap = new Map(current.map((member) => [member._id, member]));
    const onlineSet = new Set(onlineIds);

    const newIds = onlineIds.filter((id) => !currentMap.has(id));
    let fetchedNewMembers: OnlineUser[] = [];
    if (newIds.length) {
      try {
        fetchedNewMembers = await getOnlineUsersApi(newIds);
      } catch {
        fetchedNewMembers = newIds.map((id) => ({ _id: id, isOnline: true, lastSeen: now }));
      }
    }

    const fetchedMap = new Map(fetchedNewMembers.map((member) => [member._id, member]));
    const allIds = new Set<string>([
      ...current.map((member) => member._id),
      ...onlineIds,
      ...fetchedNewMembers.map((member) => member._id),
    ]);

    const nextMembers: OnlineUser[] = Array.from(allIds).map((id) => {
      const existing = currentMap.get(id);
      const fetched = fetchedMap.get(id);
      const isOnline = onlineSet.has(id);

      if (!existing && fetched) {
        return {
          _id: id,
          isOnline,
          lastSeen: isOnline ? now : fetched.lastSeen,
        };
      }

      if (!existing) {
        return {
          _id: id,
          isOnline,
          lastSeen: now,
        };
      }

      if (existing.isOnline && !isOnline) {
        return { ...existing, isOnline: false, lastSeen: now };
      }

      if (!existing.isOnline && isOnline) {
        return { ...existing, isOnline: true };
      }

      return existing;
    });

    set({ members: nextMembers });
  },
  isOnlineById: (userId) => {
    if (!userId) return false;
    return get().members.find((member) => member._id === userId)?.isOnline ?? false;
  },
  getLastSeenById: (userId) => {
    if (!userId) return null;
    return get().members.find((member) => member._id === userId)?.lastSeen ?? null;
  },
}));
