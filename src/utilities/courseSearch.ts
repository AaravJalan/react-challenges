import type { Course } from '../types';

/**
 * Matches a course against a search query.
 * - Department/Number: "CS 111", "cs111", "111", "213-1"
 * - Title: "programming", "data structures", "systems"
 * - Schedule: days ("MWF", "TuTh") or specific times with colon ("11:00", "13:00")
 * Pure digits (like "13") only match course numbers and titles, avoiding accidental meeting-hour matches.
 */
export const matchCourse = (course: Course, query: string): boolean => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const tokens = trimmed.split(/\s+/);

  const coursePrefixAndNumber = `cs ${course.number} cs${course.number} cs-${course.number} ${course.number}`.toLowerCase();
  const courseTitle = course.title.toLowerCase();
  const courseTerm = course.term.toLowerCase();
  const courseMeets = course.meets.toLowerCase();

  return tokens.every(token => {
    // If the token is purely digits (e.g. "13", "111", "213"), match only course number or title
    const isPureDigits = /^\d+$/.test(token);
    if (isPureDigits) {
      return course.number.includes(token) || courseTitle.includes(token);
    }

    // Otherwise, match across full course details including meeting days / times
    const fullHaystack = `${courseTerm} ${coursePrefixAndNumber} ${courseTitle} ${courseMeets}`;
    return fullHaystack.includes(token);
  });
};
