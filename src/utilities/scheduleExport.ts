import type { Course } from '../types';
import { parseMeeting } from './timeConflicts';

interface TermDates {
  startDate: string; // YYYY-MM-DD of the term's start Monday
  untilUTC: string;  // YYYYMMDDTHHMMSSZ for recurrence end
  untilDateStr: string; // readable end date
}

export const getTermScheduleDates = (term: string): TermDates => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isPastSummer = now.getMonth() >= 7; // August or later
  const academicStartYear = isPastSummer ? currentYear : currentYear - 1;

  if (term === 'Winter') {
    const startYear = academicStartYear + 1;
    return {
      startDate: `${startYear}-01-04`,
      untilUTC: `${startYear}0319T235959Z`,
      untilDateStr: `Mar 19, ${startYear}`,
    };
  }

  if (term === 'Spring') {
    const startYear = academicStartYear + 1;
    return {
      startDate: `${startYear}-03-29`,
      untilUTC: `${startYear}0611T235959Z`,
      untilDateStr: `Jun 11, ${startYear}`,
    };
  }

  // Fall Term (default)
  return {
    startDate: `${academicStartYear}-09-21`,
    untilUTC: `${academicStartYear}1218T235959Z`,
    untilDateStr: `Dec 18, ${academicStartYear}`,
  };
};

const DAY_OFFSET: Record<string, number> = {
  M: 0,
  Tu: 1,
  W: 2,
  Th: 3,
  F: 4,
};

const ICAL_DAY_MAP: Record<string, string> = {
  M: 'MO',
  Tu: 'TU',
  W: 'WE',
  Th: 'TH',
  F: 'FR',
};

const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const formatTimeDigits = (minutesFromMidnight: number): string => {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return `${padZero(h)}${padZero(m)}00`;
};

const getEventStartDate = (baseMonday: string, firstDayCode: string): string => {
  const [y, m, d] = baseMonday.split('-').map(Number);
  const offset = DAY_OFFSET[firstDayCode] ?? 0;
  const dateObj = new Date(Date.UTC(y, m - 1, d + offset));
  const year = dateObj.getUTCFullYear();
  const month = padZero(dateObj.getUTCMonth() + 1);
  const day = padZero(dateObj.getUTCDate());
  return `${year}${month}${day}`;
};

export interface CourseExportDetail {
  id: string;
  course: Course;
  parsedMeeting: ReturnType<typeof parseMeeting>;
  gcalUrl: string;
}

/**
 * Builds a single course's Google Calendar URL with exact recurring weekly rules.
 */
export const buildCourseGCalUrl = (course: Course, term: string): string => {
  const termConfig = getTermScheduleDates(term);
  const parsed = parseMeeting(course.meets);

  const title = encodeURIComponent(`CS ${course.number}: ${course.title}`);
  const location = encodeURIComponent('Northwestern University');
  const details = encodeURIComponent(
    `Course: CS ${course.number} - ${course.title}\nTerm: ${course.term}\nSchedule: ${course.meets}`
  );

  if (!parsed || parsed.days.length === 0) {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  }

  const firstDay = parsed.days[0];
  const dateStr = getEventStartDate(termConfig.startDate, firstDay);
  const startTimeStr = formatTimeDigits(parsed.start);
  const endTimeStr = formatTimeDigits(parsed.end);

  const byDays = parsed.days.map(d => ICAL_DAY_MAP[d] || d).join(',');
  const recur = encodeURIComponent(`RRULE:FREQ=WEEKLY;BYDAY=${byDays};UNTIL=${termConfig.untilUTC}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T${startTimeStr}/${dateStr}T${endTimeStr}&details=${details}&location=${location}&recur=${recur}&ctz=America/Chicago`;
};

/**
 * Generates an RFC 5545 compliant .ics calendar file content.
 */
export const generateICS = (courses: { id: string; course: Course }[], term: string): string => {
  const termConfig = getTermScheduleDates(term);
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const events: string[] = [];

  for (const { id, course } of courses) {
    const parsed = parseMeeting(course.meets);
    if (!parsed || parsed.days.length === 0) continue;

    const firstDay = parsed.days[0];
    const dateStr = getEventStartDate(termConfig.startDate, firstDay);
    const startDigits = formatTimeDigits(parsed.start);
    const endDigits = formatTimeDigits(parsed.end);
    const byDays = parsed.days.map(d => ICAL_DAY_MAP[d] || d).join(',');

    events.push([
      'BEGIN:VEVENT',
      `UID:cs392-${term.toLowerCase()}-${course.number}-${id}@northwestern.edu`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dateStr}T${startDigits}`,
      `DTEND:${dateStr}T${endDigits}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byDays};UNTIL=${termConfig.untilUTC}`,
      `SUMMARY:CS ${course.number}: ${course.title}`,
      `DESCRIPTION:Term: ${course.term} | Meeting: ${course.meets}`,
      'LOCATION:Northwestern University',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\r\n'));
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Northwestern CS392//Course Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:CS Schedule - ${term}`,
    'X-WR-TIMEZONE:America/Chicago',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
};

/**
 * Triggers a download of the .ics file in the browser.
 */
export const downloadICSFile = (courses: { id: string; course: Course }[], term: string): void => {
  const icsData = generateICS(courses, term);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${term.toLowerCase()}-schedule.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
