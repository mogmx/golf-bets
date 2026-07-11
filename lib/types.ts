export type Friend = {
  id: string;
  name: string;
  hcp?: string; // handicap, e.g. "12.4"
  defaultStrokes?: number; // starting strokes for a new entry; positive = recibes, negative = das
  montoApuesta?: string; // reference note, e.g. "$50 $50 $100"
  montoMarcas?: string; // reference note, e.g. "$25"
  montoMedal?: string; // reference note, e.g. "$10"
  notas?: string; // e.g. "Carry no se ajusta"
};

export type Entry = {
  id: string;
  friendId: string;
  fecha: string; // ISO date (yyyy-mm-dd)

  match: boolean; // SI/NO - hubo match
  strokes: number;

  ganado: number;
  perdido: number;
  marcasGanado: number;
  marcasPerdido: number;
  medalGanado: number;
  medalPerdido: number;

  carry: boolean; // SI/NO
  carryAjusta?: boolean; // SI/NO - if a carry happened, whether strokes still slide (default NO = don't adjust)
};

export type Team = {
  id: string;
  partnerName: string; // your partner's name
  opponent1Id: string; // Friend id
  opponent2Id: string; // Friend id
  defaultStrokes?: number; // starting strokes for a new entry; positive = recibe tu equipo, negative = da tu equipo
  montoApuesta?: string;
  montoMarcas?: string;
  montoMedal?: string;
  notas?: string;
};

export type TeamEntry = {
  id: string;
  teamId: string;
  fecha: string; // ISO date (yyyy-mm-dd)

  match: boolean; // SI/NO - hubo match
  strokes: number;

  ganado: number;
  perdido: number;
  marcasGanado: number;
  marcasPerdido: number;
  medalGanado: number;
  medalPerdido: number;

  carry: boolean; // SI/NO
  carryAjusta?: boolean; // SI/NO
};
