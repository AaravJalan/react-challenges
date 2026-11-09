import type { Course } from '../types';
import { parseMeeting } from '../utilities/timeConflicts';

interface CalendarViewProps {
  term: string;
  courses: { id: string; course: Course }[];
  startHour: number;
  endHour: number;
  onToggleCourse: (id: string) => void;
  onClear: () => void;
  isLoggedIn: boolean;
}

const DAYS = ['M', 'Tu', 'W', 'Th', 'F'] as const;
const DAY_LABELS: Record<string, string> = {
  M: 'Mon',
  Tu: 'Tue',
  W: 'Wed',
  Th: 'Thu',
  F: 'Fri',
};

const HOUR_HEIGHT = 52; // pixels per hour (taller, more spacious)
const TIME_COL_WIDTH = 54; // wide enough to easily read full "12 PM", "9 PM", etc.
const TOP_OFFSET = 16; // pixels padding at top of grid

const COURSE_PALETTES = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900' },
  { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-900' },
  { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-900' },
  { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-900' },
  { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-900' },
  { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-900' },
  { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-900' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-900' },
  { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-900' },
  { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-900' },
];

const formatHourLabel = (h: number): string => {
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
};

export const CalendarView = ({
  term,
  courses,
  startHour,
  endHour,
  onToggleCourse,
  onClear,
  isLoggedIn,
}: CalendarViewProps) => {
  // Bounded strictly by the earliest and latest course hours in the selected term
  const effectiveEndHour = endHour;
  const effectiveStartHour = startHour;
  const hoursCount = Math.max(1, effectiveEndHour - effectiveStartHour);
  const hours = Array.from({ length: hoursCount + 1 }, (_, i) => effectiveStartHour + i);
  const startMinutes = effectiveStartHour * 60;
  const totalGridHeight = TOP_OFFSET + hoursCount * HOUR_HEIGHT + 28;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col w-full">
      {/* Header Bar */}
      <div className="p-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">
              {term} Calendar
            </h3>
            <span className="px-1.5 py-0.2 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </span>
          </div>
          <p className="text-[11px] mt-0.5">
            {isLoggedIn ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Saved to account
              </span>
            ) : (
              <span className="text-gray-400">
                Guest mode &bull; Not saved
              </span>
            )}
          </p>
        </div>

        {courses.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="p-8 text-center my-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-2.5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 text-sm">No courses selected</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-0.5">
            Click any course card on the left to place it on the weekly calendar.
          </p>
        </div>
      ) : (
        /* Calendar Grid */
        <div className="overflow-y-auto max-h-[660px]">
          {/* Day Headers */}
          <div
            className="grid sticky top-0 bg-white z-20 border-b border-gray-200 py-2 text-center text-xs font-bold text-gray-700 shadow-2xs"
            style={{ gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(5, 1fr)` }}
          >
            <div className="text-gray-400 font-normal text-[11px] self-center">Time</div>
            {DAYS.map(d => (
              <div key={d} className="py-0.5">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold">
                  {DAY_LABELS[d]}
                </span>
              </div>
            ))}
          </div>

          {/* Time lines & Course blocks container */}
          <div className="relative" style={{ height: `${totalGridHeight}px` }}>
            {/* 1. Hour Lines & Full AM/PM Labels */}
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-gray-100 flex items-start pointer-events-none"
                style={{ top: `${TOP_OFFSET + i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <span
                  className="text-right pr-2.5 text-[11px] font-semibold text-gray-400 -mt-2.5 select-none"
                  style={{ width: `${TIME_COL_WIDTH}px` }}
                >
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}

            {/* 2. Five Day Column containers */}
            <div
              className="absolute top-0 bottom-0 right-0 grid grid-cols-5 divide-x divide-gray-100 pointer-events-none"
              style={{ left: `${TIME_COL_WIDTH}px` }}
            >
              {DAYS.map((dayKey) => (
                <div key={dayKey} className="relative h-full pointer-events-auto">
                  {courses.map(({ id, course }, courseIdx) => {
                    const parsed = parseMeeting(course.meets);
                    if (!parsed || !parsed.days.includes(dayKey)) return null;

                    const palette = COURSE_PALETTES[courseIdx % COURSE_PALETTES.length];
                    const topMinutes = parsed.start - startMinutes;
                    const topPx = TOP_OFFSET + (topMinutes / 60) * HOUR_HEIGHT;
                    const durationMinutes = parsed.end - parsed.start;
                    const heightPx = Math.max(30, (durationMinutes / 60) * HOUR_HEIGHT);

                    return (
                      <div
                        key={`${id}-${dayKey}`}
                        onClick={() => onToggleCourse(id)}
                        className={`absolute left-1 right-1 rounded-md border p-1.5 shadow-2xs transition-all duration-150 cursor-pointer hover:shadow-md hover:scale-[1.01] overflow-hidden z-10 flex flex-col justify-between ${palette.bg} ${palette.border} ${palette.text}`}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                        }}
                        title={`Click to remove CS ${course.number} (${course.meets}): ${course.title}`}
                      >
                        <div className="flex items-start justify-between gap-1 leading-tight">
                          <span className="font-bold text-xs truncate">
                            CS {course.number}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleCourse(id);
                            }}
                            className="w-4 h-4 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/10 text-[10px] font-bold cursor-pointer"
                            aria-label={`Remove CS ${course.number}`}
                          >
                            &times;
                          </button>
                        </div>

                        {heightPx > 42 && (
                          <p className="text-[10px] font-medium truncate opacity-85">
                            {course.title}
                          </p>
                        )}

                        <span className="text-[10px] font-semibold opacity-75 leading-none">
                          {course.meets.split(' ')[1] || course.meets}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
