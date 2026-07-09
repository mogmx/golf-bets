const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Formats like the sheet: 08-Jul-26
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dd = String(d ?? 1).padStart(2, '0');
  const mmm = MONTHS[(m ?? 1) - 1];
  const yy = String(y ?? 2000).slice(-2);
  return `${dd}-${mmm}-${yy}`;
}
