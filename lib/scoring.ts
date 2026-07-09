import { Entry, TeamEntry } from './types';

export function entryTotal(entry: Entry): number {
  return entry.ganado - entry.perdido + entry.marcas + entry.medal;
}

export function friendLifetimeTotal(entries: Entry[], friendId: string): number {
  return entries.filter((e) => e.friendId === friendId).reduce((sum, e) => sum + entryTotal(e), 0);
}

// Sliding strokes: positive = strokes received, negative = strokes given.
// Win/lose is judged on Ganado vs Perdido only (side bets don't affect the slide).
// Winning always shifts the number down by one, losing shifts it up by one
// (this also covers starting from zero: win -> -1, lose -> +1):
// receive+win -> receive one less; give+win -> give one more (more negative);
// receive+lose -> receive one more; give+lose -> give one less (less negative).
export function nextStrokes(entry: Entry): number {
  if (!entry.match) return entry.strokes;
  if (entry.carry && !entry.carryAjusta) return entry.strokes;
  if (entry.ganado === entry.perdido) return entry.strokes;
  return entry.ganado > entry.perdido ? entry.strokes - 1 : entry.strokes + 1;
}

// Current standing strokes for a friend: the slide from their most recent entry,
// or their default starting strokes if they have no entries yet.
export function currentStrokes(entries: Entry[], friendId: string, defaultStrokes: number): number {
  const last = entries
    .filter((e) => e.friendId === friendId)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  return last ? nextStrokes(last) : defaultStrokes;
}

// Same as above, duplicated for teams (2 vs 2).
export function teamEntryTotal(entry: TeamEntry): number {
  return entry.ganado - entry.perdido + entry.marcas + entry.medal;
}

export function teamLifetimeTotal(entries: TeamEntry[], teamId: string): number {
  return entries.filter((e) => e.teamId === teamId).reduce((sum, e) => sum + teamEntryTotal(e), 0);
}

export function nextTeamStrokes(entry: TeamEntry): number {
  if (!entry.match) return entry.strokes;
  if (entry.carry && !entry.carryAjusta) return entry.strokes;
  if (entry.ganado === entry.perdido) return entry.strokes;
  return entry.ganado > entry.perdido ? entry.strokes - 1 : entry.strokes + 1;
}

// Current standing strokes for a team, mirroring currentStrokes above.
export function currentTeamStrokes(entries: TeamEntry[], teamId: string, defaultStrokes: number): number {
  const last = entries
    .filter((e) => e.teamId === teamId)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  return last ? nextTeamStrokes(last) : defaultStrokes;
}
