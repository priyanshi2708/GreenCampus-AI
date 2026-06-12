import type { ResourceEntry } from './types';
import { calcCarbon } from './utils';

const buildings = [
  'Main Academic Block',
  'Science & Tech Hub',
  'Student Union',
  'Library Complex',
  'Admin Building',
  'Sports Facility',
  'Engineering Block',
];

const departments: Record<string, string[]> = {
  'Main Academic Block': ['Computer Science', 'Mathematics', 'Physics'],
  'Science & Tech Hub': ['Chemistry', 'Biotechnology', 'Research Lab'],
  'Student Union': ['Events & Culture', 'Canteen', 'Recreation'],
  'Library Complex': ['Digital Resources', 'Archives', 'Reading Halls'],
  'Admin Building': ['HR & Finance', 'Management', 'IT Services'],
  'Sports Facility': ['Athletics', 'Aquatics', 'Gymnasium'],
  'Engineering Block': ['Mechanical', 'Civil', 'Electrical'],
};

function rnd(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function generateMockData(): ResourceEntry[] {
  const entries: ResourceEntry[] = [];
  let idx = 0;

  for (let day = 0; day < 90; day++) {
    const numEntries = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numEntries; j++) {
      const building = buildings[Math.floor(Math.random() * buildings.length)];
      const deptList = departments[building];
      const department = deptList[Math.floor(Math.random() * deptList.length)];
      const electricity = rnd(120, 850);
      const water = rnd(500, 4500);
      const waste = rnd(20, 200);
      const carbon = calcCarbon(electricity, waste);
      entries.push({
        id: `mock-${idx++}`,
        building,
        department,
        electricity,
        water,
        waste,
        carbon,
        date: dateStr(day),
      });
    }
  }

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
