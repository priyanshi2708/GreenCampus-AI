export interface ResourceEntry {
  id: string;
  building: string;
  department: string;
  electricity: number; // kWh
  water: number;       // Liters
  waste: number;       // Kg
  carbon: number;      // kg CO2e — auto-calculated
  date: string;        // ISO date string YYYY-MM-DD
}

export interface ResourceFiltersState {
  building: string;
  department: string;
  month: string;   // '01'–'12'
  year: string;    // '2024', '2025', …
  dateFrom: string;
  dateTo: string;
}

export type SortKey = keyof ResourceEntry;
export type SortDir = 'asc' | 'desc';
