import { useState } from 'react';
import type { Course } from '../types';

interface CourseFormProps {
  course: Course;
  onCancel: () => void;
}

const termBadgeStyles: Record<string, string> = {
  Fall: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Winter: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Spring: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export const CourseForm = ({ course, onCancel }: CourseFormProps) => {
  const [title, setTitle] = useState(course.title);
  const [meets, setMeets] = useState(course.meets);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const badgeStyle = termBadgeStyles[course.term] || 'bg-blue-50 text-blue-700 ring-blue-600/20';

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6 transition-colors cursor-pointer group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Course List</span>
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between pb-6 border-b border-gray-100">
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset mb-2 ${badgeStyle}`}>
              {course.term} Quarter
            </span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Edit Course CS {course.number}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update the course catalog title and scheduled meeting times.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="course-title" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Course Title
            </label>
            <input
              id="course-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
              placeholder="e.g. Fundamentals of Computer Programming"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              The full official title as listed in the academic catalog.
            </p>
          </div>

          <div>
            <label htmlFor="course-meets" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Meeting Times
            </label>
            <input
              id="course-meets"
              type="text"
              value={meets}
              onChange={(e) => setMeets(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
              placeholder="e.g. MWF 10:00-10:50 or TuTh 14:00-15:20"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Specify days (e.g. MWF, TuTh) followed by timespan (HH:MM-HH:MM).
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-2xs transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
