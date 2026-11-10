import type { Course } from '../types';

export type LevelFilter = 'All' | '100' | '200' | '300+';
export type DayFilter = 'All' | 'MWF' | 'TuTh';
export type TimeFilter = 'All' | 'Morning' | 'Afternoon';

export interface FilterState {
  level: LevelFilter;
  day: DayFilter;
  time: TimeFilter;
}

export const INITIAL_FILTERS: FilterState = {
  level: 'All',
  day: 'All',
  time: 'All',
};

export const matchLevel = (course: Course, level: LevelFilter): boolean => {
  if (level === 'All') return true;
  const num = parseInt(course.number, 10);
  if (isNaN(num)) return true;
  if (level === '100') return num >= 100 && num < 200;
  if (level === '200') return num >= 200 && num < 300;
  if (level === '300+') return num >= 300;
  return true;
};

export const matchDay = (course: Course, day: DayFilter): boolean => {
  if (day === 'All') return true;
  return (course.meets || '').includes(day);
};

export const matchTimeOfDay = (course: Course, time: TimeFilter): boolean => {
  if (time === 'All') return true;
  if (!course.meets) return false;
  const match = course.meets.match(/\b(\d{1,2}):\d{2}/);
  if (!match) return false;
  const startHour = parseInt(match[1], 10);
  if (time === 'Morning') return startHour < 12;
  if (time === 'Afternoon') return startHour >= 12;
  return true;
};

export const filterCourse = (course: Course, filters: FilterState): boolean => {
  return (
    matchLevel(course, filters.level) &&
    matchDay(course, filters.day) &&
    matchTimeOfDay(course, filters.time)
  );
};
