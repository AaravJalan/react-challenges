import type { Course } from '../types';

export interface ParsedMeeting {
  days: string[];
  start: number; // minutes from midnight
  end: number;
}

const toMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Single-pass regex parser handling whitespace and token validation
export const parseMeeting = (meets: string): ParsedMeeting | null => {
  if (!meets) return null;
  const match = meets.trim().match(/^([A-Za-z]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!match) return null;

  const [, daysStr, startStr, endStr] = match;
  const days = daysStr.match(/Tu|Th|Sa|Su|M|W|F/g) || [];

  return {
    days,
    start: toMinutes(startStr),
    end: toMinutes(endStr),
  };
};

export const hasConflict = (c1: Course, c2: Course): boolean => {
  if (c1.term !== c2.term) return false;
  const m1 = parseMeeting(c1.meets);
  const m2 = parseMeeting(c2.meets);
  if (!m1 || !m2) return false;

  const daysOverlap = m1.days.some(d => m2.days.includes(d));
  const timesOverlap = Math.max(m1.start, m2.start) < Math.min(m1.end, m2.end);

  return daysOverlap && timesOverlap;
};

// Returns the specific conflicting course for clear UI feedback
export const getConflictingCourse = (course: Course, selectedCourses: Course[]): Course | undefined => {
  return selectedCourses.find(selected => hasConflict(course, selected));
};
