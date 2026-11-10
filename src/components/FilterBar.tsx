import { useState, useRef, useEffect } from 'react';
import type { LevelFilter, DayFilter, TimeFilter, FilterState } from '../utilities/courseFilters';

interface FilterBarProps {
  filters: FilterState;
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  isActive: boolean;
}

const LEVELS: LevelFilter[] = ['All', '100', '200', '300+'];
const DAYS: DayFilter[] = ['All', 'MWF', 'TuTh'];
const TIMES: TimeFilter[] = ['All', 'Morning', 'Afternoon'];

export const FilterBar = ({ filters, onChange, onReset, isActive }: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Count active filter dimensions
  const activeCount = [
    filters.level !== 'All',
    filters.day !== 'All',
    filters.time !== 'All',
  ].filter(Boolean).length;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Compact Square Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Filter courses"
        aria-expanded={isOpen}
        title="Filter courses by level, days, or time"
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer shadow-2xs ${
          isOpen
            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
            : isActive
            ? 'bg-blue-50/80 border-blue-400 text-blue-700 hover:bg-blue-100/70'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        {/* Sliders / Funnel filter icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>

        {/* Small active badge on the top right */}
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full border-2 border-white shadow-xs">
            {activeCount}
          </span>
        )}
      </button>

      {/* Floating Filter Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Course Filters</span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {activeCount} active
                </span>
              )}
            </div>
            {isActive && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Filter options */}
          <div className="space-y-3.5 py-3 text-xs">
            {/* Level Filter */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Course Level</label>
              <div className="grid grid-cols-4 gap-1.5">
                {LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onChange('level', lvl)}
                    className={`py-1 px-2 rounded-lg font-medium text-center transition-all cursor-pointer ${
                      filters.level === lvl
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Days Filter */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Meeting Days</label>
              <div className="grid grid-cols-3 gap-1.5">
                {DAYS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onChange('day', d)}
                    className={`py-1 px-2 rounded-lg font-medium text-center transition-all cursor-pointer ${
                      filters.day === d
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">Time of Day</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIMES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange('time', t)}
                    className={`py-1 px-2 rounded-lg font-medium text-center transition-all cursor-pointer ${
                      filters.time === t
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popover Footer */}
          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
