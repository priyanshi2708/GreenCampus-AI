export type ResourceType = 'electricity' | 'water' | 'waste' | 'carbon';

export interface ForecastCardData {
  type: ResourceType;
  title: string;
  unit: string;
  currentValue: number;
  predictedValue: number;
  pctChange: number;
  confidence: number;
  trend: number[];
}

export interface ScenarioParams {
  studentCount: number;
  buildingsCount: number;
  labUsage: number;
  operatingHours: number;
}

export interface ScenarioImpact {
  electricity: number;
  water: number;
  waste: number;
  carbon: number;
}
