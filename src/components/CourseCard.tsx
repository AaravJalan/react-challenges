import type { Course } from '../types';

interface CourseCardProps {
  id: string;
  course: Course;
  selected: boolean;
  toggleSelected: (id: string) => void;
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

export const CourseCard = ({ id, course, selected, toggleSelected }: CourseCardProps) => {
  const theme = termTheme[course.term] || defaultTheme;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelected(id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={`modern-card relative cursor-pointer select-none transition-all duration-200 outline-none ${
        selected ? `${theme.selectedRing} ${theme.selectedBg} shadow-md` : 'hover:shadow-md'
      }`}
      onClick={() => toggleSelected(id)}
      onKeyDown={handleKeyDown}
    >
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

      <div className="modern-card-footer">
        <p className={`inline-flex items-center justify-center rounded-full px-3.5 py-1 text-sm font-semibold ${theme.badge}`}>
          {course.meets}
        </p>
      </div>
    </div>
  );
};
