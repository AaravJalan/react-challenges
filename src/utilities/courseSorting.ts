import type { Course } from '../types';

export type SortKey = 'number' | 'title' | 'time';
export type SortDirection = 'asc' | 'desc';

export const getStartMinutes = (meets: string): number => {
  const match = (meets || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return Infinity;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

export const compareCourses = (
  a: Course,
  b: Course,
  key: SortKey,
  direction: SortDirection = 'asc'
): number => {
  const multiplier = direction === 'asc' ? 1 : -1;

  switch (key) {
    case 'number': {
      const numA = parseInt(a.number, 10);
      const numB = parseInt(b.number, 10);
      if (isNaN(numA) && isNaN(numB)) return 0;
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      if (numA !== numB) return (numA - numB) * multiplier;
      return a.number.localeCompare(b.number) * multiplier;
    }
    case 'title':
      return a.title.localeCompare(b.title) * multiplier;
    case 'time': {
      const minA = getStartMinutes(a.meets);
      const minB = getStartMinutes(b.meets);
      if (minA !== minB) return (minA - minB) * multiplier;
      // Secondary sort by course number if same time
      return (parseInt(a.number, 10) - parseInt(b.number, 10)) * multiplier;
    }
    default:
      return 0;
  }
};
