import { useState } from 'react';
import type { Schedule } from '../types';
import { TermSelector } from './TermSelector';
import { CourseCard } from './CourseCard';
import { Modal } from './Modal';

const terms = ['Fall', 'Winter', 'Spring'] as const;

const termHeaderStyles: Record<string, string> = {
  Fall: 'text-orange-900 bg-orange-50 border-orange-200',
  Winter: 'text-blue-900 bg-blue-50 border-blue-200',
  Spring: 'text-emerald-900 bg-emerald-50 border-emerald-200',
};

export const TermPage = ({ schedule }: { schedule: Schedule }) => {
  const [selectedTerm, setSelectedTerm] = useState('Fall');
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleSelected = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };
  
  const filteredCourses = Object.entries(schedule.courses).filter(
    ([, course]) => course.term === selectedTerm
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <TermSelector term={selectedTerm} setTerm={setSelectedTerm} />
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer shadow-xs"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Course Plan</span>
          {selected.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
              {selected.length}
            </span>
          )}
        </button>
      </div>

      <Modal open={open} close={() => setOpen(false)} title="Course Plan">
        {selected.length === 0 ? (
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
              const coursesInTerm = selected
                .map(id => ({ id, ...schedule.courses[id] }))
                .filter(c => c.term === t);

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

      <div className="modern-card-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(([id, course]) => (
            <CourseCard
              key={id}
              id={id}
              course={course}
              selected={selected.includes(id)}
              toggleSelected={toggleSelected}
            />
          ))
        ) : (
          <div className="p-8 text-gray-500 font-medium bg-white rounded-xl shadow-sm ring-1 ring-black/5 w-full text-center">
            No courses found for {selectedTerm}.
          </div>
        )}
      </div>
    </div>
  );
};
