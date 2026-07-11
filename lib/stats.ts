import { entryTotal, teamEntryTotal } from './scoring';
import { Entry, TeamEntry } from './types';

export type BalancePoint = { date: string; balance: number };

export type Stats = {
  roundsPlayed: number;
  matchWins: number;
  matchLosses: number;
  matchTies: number;
  marcasWins: number;
  marcasLosses: number;
  marcasTies: number;
  marcasBalance: number;
  medalBalance: number;
  balancePoints: BalancePoint[]; // cumulative balance, sorted oldest to newest
};

export function computeStats(entries: Entry[]): Stats {
  const sorted = [...entries].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));

  let running = 0;
  const balancePoints = sorted.map((e) => {
    running += entryTotal(e);
    return { date: e.fecha, balance: running };
  });

  let matchWins = 0;
  let matchLosses = 0;
  let matchTies = 0;
  let marcasWins = 0;
  let marcasLosses = 0;
  let marcasTies = 0;
  let marcasBalance = 0;
  let medalBalance = 0;
  for (const e of entries) {
    if (e.ganado > e.perdido) matchWins++;
    else if (e.perdido > e.ganado) matchLosses++;
    else matchTies++;

    if (e.marcasGanado > e.marcasPerdido) marcasWins++;
    else if (e.marcasPerdido > e.marcasGanado) marcasLosses++;
    else marcasTies++;

    marcasBalance += e.marcasGanado - e.marcasPerdido;
    medalBalance += e.medalGanado - e.medalPerdido;
  }

  return {
    roundsPlayed: entries.length,
    matchWins,
    matchLosses,
    matchTies,
    marcasWins,
    marcasLosses,
    marcasTies,
    marcasBalance,
    medalBalance,
    balancePoints,
  };
}

// Same as above, duplicated for teams (2 vs 2).
export function computeTeamStats(entries: TeamEntry[]): Stats {
  const sorted = [...entries].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));

  let running = 0;
  const balancePoints = sorted.map((e) => {
    running += teamEntryTotal(e);
    return { date: e.fecha, balance: running };
  });

  let matchWins = 0;
  let matchLosses = 0;
  let matchTies = 0;
  let marcasWins = 0;
  let marcasLosses = 0;
  let marcasTies = 0;
  let marcasBalance = 0;
  let medalBalance = 0;
  for (const e of entries) {
    if (e.ganado > e.perdido) matchWins++;
    else if (e.perdido > e.ganado) matchLosses++;
    else matchTies++;

    if (e.marcasGanado > e.marcasPerdido) marcasWins++;
    else if (e.marcasPerdido > e.marcasGanado) marcasLosses++;
    else marcasTies++;

    marcasBalance += e.marcasGanado - e.marcasPerdido;
    medalBalance += e.medalGanado - e.medalPerdido;
  }

  return {
    roundsPlayed: entries.length,
    matchWins,
    matchLosses,
    matchTies,
    marcasWins,
    marcasLosses,
    marcasTies,
    marcasBalance,
    medalBalance,
    balancePoints,
  };
}
