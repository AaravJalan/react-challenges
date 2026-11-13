import { useState, useMemo } from 'react';
import type { Schedule, Course } from '../types';
import { TermSelector } from './TermSelector';
import { CourseCard } from './CourseCard';
import { Modal } from './Modal';
import { CourseForm } from './CourseForm';
import { CalendarView } from './CalendarView';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { SortControl } from './SortControl';
import { ExportModal } from './ExportModal';
import { getConflictingCourse, parseMeeting } from '../utilities/timeConflicts';
import { matchCourse } from '../utilities/courseSearch';
import { filterCourse, INITIAL_FILTERS, type FilterState } from '../utilities/courseFilters';
import { compareCourses, type SortKey, type SortDirection } from '../utilities/courseSorting';
import { downloadICSFile } from '../utilities/scheduleExport';
import { useCalendarSchedule } from '../hooks/useCalendarSchedule';

const terms = ['Fall', 'Winter', 'Spring'] as const;

const termHeaderStyles: Record<string, string> = {
  Fall: 'text-orange-900 bg-orange-50 border-orange-200',
  Winter: 'text-blue-900 bg-blue-50 border-blue-200',
  Spring: 'text-emerald-900 bg-emerald-50 border-emerald-200',
};

export const TermPage = ({ schedule }: { schedule: Schedule }) => {
  const [selectedTerm, setSelectedTerm] = useState('Fall');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>('number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [open, setOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showGCalModal, setShowGCalModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{ id: string; course: Course } | null>(null);

  const {
    user,
    isAdmin,
    activeSchedules,
    currentTermSelected,
    toggleCourse,
    clearTerm,
    totalSelectedCount,
  } = useCalendarSchedule(selectedTerm);

  const calendarCourses = useMemo(() => {
    return currentTermSelected
      .map(id => ({ id, course: schedule.courses[id] }))
      .filter((item): item is { id: string; course: Course } => Boolean(item.course));
  }, [currentTermSelected, schedule.courses]);

  const exportICS = () => {
    if (calendarCourses.length === 0) {
      alert(`No courses selected for ${selectedTerm} term to export.`);
      return;
    }
    downloadICSFile(calendarCourses, selectedTerm);
  };

  const exportGCal = () => {
    if (calendarCourses.length === 0) {
      alert(`No courses selected for ${selectedTerm} term to export.`);
      return;
    }
    setShowGCalModal(true);
  };

  // Dynamic hours: default to daytime 9 AM - 5 PM, and only expand to 6 PM, 8 PM, or 9 PM
  // if an enrolled course actually extends that late!
  const { startHour, endHour } = useMemo(() => {
    let minH = 9;
    let maxH = 17; // standard 5 PM

    for (const { course } of calendarCourses) {
      const p = parseMeeting(course.meets);
      if (p) {
        const sh = Math.floor(p.start / 60);
        const eh = Math.ceil(p.end / 60);
        if (sh < minH) minH = sh;
        if (eh > maxH) maxH = eh;
      }
    }

    return {
      startHour: minH,
      endHour: maxH,
    };
  }, [calendarCourses]);

  const selectedCourseList = useMemo(() => {
    return currentTermSelected.map(selId => schedule.courses[selId]).filter(Boolean);
  }, [currentTermSelected, schedule.courses]);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isFilterActive =
    filters.level !== 'All' ||
    filters.day !== 'All' ||
    filters.time !== 'All' ||
    Boolean(searchQuery);

  const resetAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  const filteredCourses = useMemo(() => {
    const matched = Object.entries(schedule.courses).filter(([, course]) => {
      if (course.term !== selectedTerm) return false;
      if (!matchCourse(course, searchQuery)) return false;
      return filterCourse(course, filters);
    });

    matched.sort(([, a], [, b]) => compareCourses(a, b, sortBy, sortDirection));

    return matched;
  }, [schedule.courses, selectedTerm, searchQuery, filters, sortBy, sortDirection]);

  if (editingCourse && isAdmin) {
    return (
      <CourseForm
        id={editingCourse.id}
        course={editingCourse.course}
        onCancel={() => setEditingCourse(null)}
      />
    );
  }

  return (
    <div>
      {/* Top Header controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6">
        <div className="flex justify-start">
          <TermSelector term={selectedTerm} setTerm={setSelectedTerm} />
        </div>

        {/* Search input and compact filter button in middle */}
        <div className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto">
          <div className="flex-1 min-w-0">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <FilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetAllFilters}
            isActive={isFilterActive}
          />
        </div>

        <div className="flex justify-end items-center gap-2">
          {/* Export schedule for currently selected term */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExport(prev => !prev)}
              aria-label={`Export ${selectedTerm} schedule`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-2xs transition-all duration-200 cursor-pointer text-sm"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Export</span>
            </button>

            {showExport && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    exportICS();
                    setShowExport(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer font-medium text-gray-700"
                >
                  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Download .ics</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportGCal();
                    setShowExport(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer font-medium text-gray-700"
                >
                  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Google Calendar</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-2xs transition-all duration-200 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Course Plan</span>
            {totalSelectedCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                {totalSelectedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Course Plan Modal */}
      <Modal open={open} close={() => setOpen(false)} title="Course Plan">
        {/* On mobile screens (< lg): display interactive weekly calendar view right at the top */}
        <div className="block lg:hidden mb-6">
          <CalendarView
            term={selectedTerm}
            courses={calendarCourses}
            startHour={startHour}
            endHour={endHour}
            onToggleCourse={toggleCourse}
            onClear={clearTerm}
            isLoggedIn={Boolean(user)}
          />
        </div>

        {totalSelectedCount === 0 ? (
          <div className="text-center py-6 px-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-base mb-1">No courses selected</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Click any course card to add it to your schedule. You can view all your selected courses grouped by term here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {terms.map(t => {
              const termIds = activeSchedules[t] || [];
              const coursesInTerm = termIds
                .map(id => ({ id, ...schedule.courses[id] }))
                .filter(c => Boolean(c.title));

              if (coursesInTerm.length === 0) return null;

              return (
                <div key={t} className="space-y-2.5">
                  <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm tracking-wide flex items-center justify-between ${termHeaderStyles[t]}`}>
                    <span>{t} Term</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/90 shadow-xs">
                      {coursesInTerm.length} {coursesInTerm.length === 1 ? 'course' : 'courses'}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 rounded-xl bg-gray-50/70 p-2 border border-gray-100">
                    {coursesInTerm.map(course => (
                      <div key={course.id} className="py-2.5 px-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            CS {course.number}: {course.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            {course.meets}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Main Layout: Courses on Left (6 Columns), Calendar on Right on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left: Courses (6 cols = 50% width, 3 relaxed cards in each row) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {selectedTerm} Courses ({filteredCourses.length})
            </h2>
            <SortControl
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortByChange={setSortBy}
              onToggleDirection={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            />
          </div>

          {/* 3 columns of relaxed cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 p-1 max-h-[780px] overflow-y-auto pr-1">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(([id, course]) => {
                const isSelected = currentTermSelected.includes(id);
                const conflictCourse = !isSelected ? getConflictingCourse(course, selectedCourseList) : undefined;

                return (
                  <div key={id} className="w-full">
                    <CourseCard
                      id={id}
                      course={course}
                      selected={isSelected}
                      conflictCourse={conflictCourse}
                      toggleSelected={toggleCourse}
                      onEdit={(courseId, courseObj) => setEditingCourse({ id: courseId, course: courseObj })}
                      canEdit={isAdmin}
                    />
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-8 text-gray-500 font-medium bg-white rounded-xl shadow-xs border border-gray-100 w-full text-center text-sm">
                {isFilterActive ? (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">
                      No courses match your active search or filters
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Try broadening your search term or selecting &quot;All&quot; for level, days, or time.
                    </p>
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  `No courses found for ${selectedTerm}.`
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Expanded weekly calendar on desktop (hidden on mobile, opened via Course Plan button) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-6 lg:sticky lg:top-4">
          <CalendarView
            term={selectedTerm}
            courses={calendarCourses}
            startHour={startHour}
            endHour={endHour}
            onToggleCourse={toggleCourse}
            onClear={clearTerm}
            isLoggedIn={Boolean(user)}
          />
        </div>
      </div>

      {/* Export to Google Calendar Modal */}
      <ExportModal
        open={showGCalModal}
        onClose={() => setShowGCalModal(false)}
        term={selectedTerm}
        courses={calendarCourses}
      />
    </div>
  );
};
