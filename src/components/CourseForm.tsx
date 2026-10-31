import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../utilities/firebase';
import type { Course } from '../types';
import {
  validateTerm,
  validateNumber,
  validateTitle,
  validateMeets,
} from '../utilities/courseValidation';

interface CourseFormProps {
  id: string;
  course: Course;
  onCancel: () => void;
}

const termBadgeStyles: Record<string, string> = {
  Fall: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Winter: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Spring: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Summer: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export const CourseForm = ({ id, course, onCancel }: CourseFormProps) => {
  const [term, setTerm] = useState(course.term);
  const [number, setNumber] = useState(course.number);
  const [title, setTitle] = useState(course.title);
  const [meets, setMeets] = useState(course.meets);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    term?: string;
    number?: string;
    title?: string;
    meets?: string;
  }>({
    term: validateTerm(course.term),
    number: validateNumber(course.number),
    title: validateTitle(course.title),
    meets: validateMeets(course.meets),
  });

  const handleTermChange = (val: string) => {
    setTerm(val);
    setErrors(prev => ({ ...prev, term: validateTerm(val) }));
  };

  const handleNumberChange = (val: string) => {
    setNumber(val);
    setErrors(prev => ({ ...prev, number: validateNumber(val) }));
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setErrors(prev => ({ ...prev, title: validateTitle(val) }));
  };

  const handleMeetsChange = (val: string) => {
    setMeets(val);
    setErrors(prev => ({ ...prev, meets: validateMeets(val) }));
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const hasChanged =
    term !== course.term ||
    number !== course.number ||
    title !== course.title ||
    meets !== course.meets;

  const canSubmit = !hasErrors && hasChanged;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const updatedCourse: Course = { term, number, title, meets };
      await update(ref(database, `/courses/${id}`), updatedCourse);
      onCancel();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save changes.');
      setIsSubmitting(false);
    }
  };

  const badgeStyle = termBadgeStyles[term] || 'bg-gray-50 text-gray-700 ring-gray-600/20';

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
              {term || 'Course'} Quarter
            </span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Edit Course CS {number || course.number}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update course term, number, title, and scheduled meeting times.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Term & Number row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="course-term" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Term
              </label>
              <div className="relative">
                <select
                  id="course-term"
                  value={term}
                  onChange={(e) => handleTermChange(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs cursor-pointer"
                >
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Academic quarter for this course offering.
              </p>
            </div>

            <div>
              <label htmlFor="course-number" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Course Number
              </label>
              <input
                id="course-number"
                type="text"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                aria-invalid={Boolean(errors.number)}
                className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs ${
                  errors.number
                    ? 'border-red-400 focus:ring-2 focus:ring-red-500 bg-red-50/20'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent'
                }`}
                placeholder="e.g. 213 or 213-2"
              />
              {errors.number ? (
                <p className="text-xs font-medium text-red-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.number}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1.5">
                  Catalog number for this course offering.
                </p>
              )}
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="course-title" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Course Title
            </label>
            <input
              id="course-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              aria-invalid={Boolean(errors.title)}
              className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs ${
                errors.title
                  ? 'border-red-400 focus:ring-2 focus:ring-red-500 bg-red-50/20'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent'
              }`}
              placeholder="e.g. Fundamentals of Computer Programming"
            />
            {errors.title ? (
              <p className="text-xs font-medium text-red-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.title}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1.5">
                The full official title as listed in the academic catalog (minimum 2 characters).
              </p>
            )}
          </div>

          {/* Meets Field */}
          <div>
            <label htmlFor="course-meets" className="block text-sm font-semibold text-gray-900 mb-1.5">
              Meeting Times
            </label>
            <input
              id="course-meets"
              type="text"
              value={meets}
              onChange={(e) => handleMeetsChange(e.target.value)}
              aria-invalid={Boolean(errors.meets)}
              className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs ${
                errors.meets
                  ? 'border-red-400 focus:ring-2 focus:ring-red-500 bg-red-50/20'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent'
              }`}
              placeholder="e.g. MWF 10:00-10:50 or leave empty"
            />
            {errors.meets ? (
              <p className="text-xs font-medium text-red-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.meets}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1.5">
                Format: days (MWF, TuTh) followed by timespan (e.g. 10:00-10:50), or empty string.
              </p>
            )}
          </div>

          {/* Form Actions */}
          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {submitError}
            </div>
          )}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-2xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${
                canSubmit && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer hover:shadow-md'
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
