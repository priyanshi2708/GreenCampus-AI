/** Carbon emission factors */
const ELECTRICITY_FACTOR = 0.233; // kg CO2e per kWh
const WASTE_FACTOR = 0.054;       // kg CO2e per kg waste

/** Auto-calculate carbon from electricity + waste */
export function calcCarbon(electricity: number, waste: number): number {
  return parseFloat((electricity * ELECTRICITY_FACTOR + waste * WASTE_FACTOR).toFixed(2));
}

/** Generate a short unique ID */
export function generateId(): string {
  return `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Format number with commas */
export function fmt(n: number, decimals = 1): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

/** Aggregate today's totals from an entry list */
export function getTodayTotals(entries: { date: string; electricity: number; water: number; waste: number; carbon: number }[]) {
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.date === today);
  return todayEntries.reduce(
    (acc, e) => ({
      electricity: acc.electricity + e.electricity,
      water: acc.water + e.water,
      waste: acc.waste + e.waste,
      carbon: acc.carbon + e.carbon,
    }),
    { electricity: 0, water: 0, waste: 0, carbon: 0 },
  );
}

/** Get last-7-days totals per day for sparklines */
export function getWeeklyTrend(
  entries: { date: string; electricity: number; water: number; waste: number; carbon: number }[],
  key: 'electricity' | 'water' | 'waste' | 'carbon',
): number[] {
  const result: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayTotal = entries.filter((e) => e.date === ds).reduce((s, e) => s + e[key], 0);
    result.push(parseFloat(dayTotal.toFixed(2)));
  }
  return result;
}
