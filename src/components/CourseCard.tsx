import type { Course } from '../types';

interface CourseCardProps {
  id: string;
  course: Course;
  selected: boolean;
  conflictCourse?: Course;
  toggleSelected: (id: string) => void;
  onEdit?: (course: Course) => void;
}

const termTheme: Record<string, {
  selectedRing: string;
  selectedBg: string;
  badge: string;
  checkBadge: string;
}> = {
  Fall: {
    selectedRing: '!ring-2 !ring-orange-500 shadow-orange-100',
    selectedBg: '!bg-orange-50/50',
    badge: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/20',
    checkBadge: 'bg-orange-500 text-white',
  },
  Winter: {
    selectedRing: '!ring-2 !ring-blue-600 shadow-blue-100',
    selectedBg: '!bg-blue-50/50',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/20',
    checkBadge: 'bg-blue-600 text-white',
  },
  Spring: {
    selectedRing: '!ring-2 !ring-emerald-600 shadow-emerald-100',
    selectedBg: '!bg-emerald-50/50',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-700/20',
    checkBadge: 'bg-emerald-600 text-white',
  },
};

const defaultTheme = {
  selectedRing: '!ring-2 !ring-blue-600 shadow-blue-100',
  selectedBg: '!bg-blue-50/50',
  badge: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/20',
  checkBadge: 'bg-blue-600 text-white',
};

export const CourseCard = ({ id, course, selected, conflictCourse, toggleSelected, onEdit }: CourseCardProps) => {
  const theme = termTheme[course.term] || defaultTheme;
  const isConflict = Boolean(conflictCourse && !selected);

  const handleClick = () => {
    if (isConflict) return;
    toggleSelected(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const cardStateClass = isConflict
    ? 'opacity-40 cursor-not-allowed bg-gray-100/70 hover:shadow-none'
    : selected
    ? `${theme.selectedRing} ${theme.selectedBg} shadow-md cursor-pointer`
    : 'hover:shadow-md cursor-pointer';

  return (
    <div
      role="button"
      tabIndex={isConflict ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={isConflict}
      className={`modern-card relative select-none transition-all duration-200 outline-none ${cardStateClass}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {isConflict && conflictCourse && (
        <div className="absolute top-4 right-4 group/tooltip z-20">
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 text-xs font-semibold shadow-xs cursor-help"
            title={`Time conflict with ${conflictCourse.term} CS ${conflictCourse.number} (${conflictCourse.meets})`}
          >
            <span className="font-bold">✕</span>
            <span>CS {conflictCourse.number}</span>
          </span>

          {/* Instant custom styled tooltip */}
          <div className="pointer-events-none absolute top-full right-0 mt-1.5 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 flex flex-col items-end z-30 whitespace-nowrap">
            <div className="w-2 h-2 bg-gray-900 rotate-45 mr-4 -mb-1"></div>
            <div className="bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl ring-1 ring-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              <span>Conflicts with <strong>{conflictCourse.term} CS {conflictCourse.number}</strong> ({conflictCourse.meets})</span>
            </div>
          </div>
        </div>
      )}
      {selected && (
        <span
          className={`absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full shadow-sm ${theme.checkBadge}`}
          aria-hidden="true"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      <h2 className="modern-card-header pr-8">
        {course.term} CS {course.number}
      </h2>
      <p className="modern-card-title">
        {course.title}
      </p>

      <div className="modern-card-footer flex justify-between items-center">
        <p className={`inline-flex items-center justify-center rounded-full px-3.5 py-1 text-sm font-semibold ${theme.badge}`}>
          {course.meets}
        </p>
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(course);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:ring-blue-300 transition-all shadow-2xs cursor-pointer group/edit"
            aria-label={`Edit ${course.term} CS ${course.number}`}
            title={`Edit ${course.term} CS ${course.number}`}
          >
            <svg className="w-4 h-4 text-gray-500 group-hover/edit:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
