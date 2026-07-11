import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Entry, Friend, Team, TeamEntry } from './types';

type Store = {
  friends: Friend[];
  entries: Entry[];
  teams: Team[];
  teamEntries: TeamEntry[];

  addFriend: (name: string) => Friend;
  updateFriend: (
    id: string,
    patch: Partial<Pick<Friend, 'name' | 'hcp' | 'defaultStrokes' | 'montoApuesta' | 'montoMarcas' | 'montoMedal' | 'notas'>>
  ) => void;
  deleteFriend: (id: string) => void;

  addEntry: (friendId: string, fecha: string, initialStrokes?: number) => Entry;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;

  addTeam: (partnerName: string, opponent1Id: string, opponent2Id: string) => Team;
  updateTeam: (
    id: string,
    patch: Partial<
      Pick<
        Team,
        | 'partnerName'
        | 'opponent1Id'
        | 'opponent2Id'
        | 'defaultStrokes'
        | 'montoApuesta'
        | 'montoMarcas'
        | 'montoMedal'
        | 'notas'
      >
    >
  ) => void;
  deleteTeam: (id: string) => void;

  addTeamEntry: (teamId: string, fecha: string, initialStrokes?: number) => TeamEntry;
  updateTeamEntry: (id: string, patch: Partial<TeamEntry>) => void;
  deleteTeamEntry: (id: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      friends: [],
      entries: [],
      teams: [],
      teamEntries: [],

      addFriend: (name) => {
        const friend: Friend = { id: uuid.v4() as string, name };
        set((s) => ({ friends: [...s.friends, friend] }));
        return friend;
      },
      updateFriend: (id, patch) => {
        set((s) => ({ friends: s.friends.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
      },
      deleteFriend: (id) => {
        set((s) => ({
          friends: s.friends.filter((f) => f.id !== id),
          entries: s.entries.filter((e) => e.friendId !== id),
        }));
      },

      addEntry: (friendId, fecha, initialStrokes = 0) => {
        const entry: Entry = {
          id: uuid.v4() as string,
          friendId,
          fecha,
          match: true,
          strokes: initialStrokes,
          ganado: 0,
          perdido: 0,
          marcasGanado: 0,
          marcasPerdido: 0,
          medalGanado: 0,
          medalPerdido: 0,
          carry: false,
          carryAjusta: false,
        };
        set((s) => ({ entries: [...s.entries, entry] }));
        return entry;
      },
      updateEntry: (id, patch) => {
        set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
      },
      deleteEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      },

      addTeam: (partnerName, opponent1Id, opponent2Id) => {
        const team: Team = { id: uuid.v4() as string, partnerName, opponent1Id, opponent2Id };
        set((s) => ({ teams: [...s.teams, team] }));
        return team;
      },
      updateTeam: (id, patch) => {
        set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
      },
      deleteTeam: (id) => {
        set((s) => ({
          teams: s.teams.filter((t) => t.id !== id),
          teamEntries: s.teamEntries.filter((e) => e.teamId !== id),
        }));
      },

      addTeamEntry: (teamId, fecha, initialStrokes = 0) => {
        const entry: TeamEntry = {
          id: uuid.v4() as string,
          teamId,
          fecha,
          match: true,
          strokes: initialStrokes,
          ganado: 0,
          perdido: 0,
          marcasGanado: 0,
          marcasPerdido: 0,
          medalGanado: 0,
          medalPerdido: 0,
          carry: false,
          carryAjusta: false,
        };
        set((s) => ({ teamEntries: [...s.teamEntries, entry] }));
        return entry;
      },
      updateTeamEntry: (id, patch) => {
        set((s) => ({ teamEntries: s.teamEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
      },
      deleteTeamEntry: (id) => {
        set((s) => ({ teamEntries: s.teamEntries.filter((e) => e.id !== id) }));
      },
    }),
    {
      name: 'golf-bets-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          const migrateEntries = (entries: any[]) =>
            (entries ?? []).map((e) => ({
              ...e,
              marcasGanado: e.marcasGanado ?? e.marcas ?? 0,
              marcasPerdido: e.marcasPerdido ?? 0,
              medalGanado: e.medalGanado ?? e.medal ?? 0,
              medalPerdido: e.medalPerdido ?? 0,
            }));
          persistedState.entries = migrateEntries(persistedState.entries);
          persistedState.teamEntries = migrateEntries(persistedState.teamEntries);
        }
        return persistedState;
      },
    }
  )
);
