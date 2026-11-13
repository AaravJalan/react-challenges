import type { Course } from '../types';
import { buildCourseGCalUrl, downloadICSFile } from '../utilities/scheduleExport';
import { Modal } from './Modal';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  term: string;
  courses: { id: string; course: Course }[];
}

export const ExportModal = ({ open, onClose, term, courses }: ExportModalProps) => {
  const handleDownloadAndOpenGCal = () => {
    downloadICSFile(courses, term);
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank');
  };

  return (
    <Modal open={open} close={onClose} title={`Export ${term} Schedule to Google Calendar`}>
      <div className="space-y-5 text-sm">
        {/* Recommended Option: 1-click batch import */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">
                Add All {courses.length} Courses at Once
              </h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Google Calendar requires importing a file to add multiple recurring courses at once.
                Click below to download your schedule and open Google Calendar&apos;s import screen.
              </p>
              <button
                type="button"
                onClick={handleDownloadAndOpenGCal}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>Import All to Google Calendar</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Individual Course Links */}
        <div>
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2.5">
            Or Add Courses Individually:
          </h4>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden bg-white">
            {courses.map(({ id, course }) => {
              const url = buildCourseGCalUrl(course, term);
              return (
                <div key={id} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900 text-xs">
                      CS {course.number}: {course.title}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {course.meets}
                    </div>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                  >
                    <span>Add Event</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
