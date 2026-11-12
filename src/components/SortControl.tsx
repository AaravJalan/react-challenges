import type { SortKey, SortDirection } from '../utilities/courseSorting';

interface SortControlProps {
  sortBy: SortKey;
  sortDirection: SortDirection;
  onSortByChange: (key: SortKey) => void;
  onToggleDirection: () => void;
}

export const SortControl = ({
  sortBy,
  sortDirection,
  onSortByChange,
  onToggleDirection,
}: SortControlProps) => {
  return (
    <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200/90 rounded-xl px-2.5 py-1 shadow-2xs">
      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Sort:
      </span>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as SortKey)}
        aria-label="Sort courses by"
        className="text-xs font-medium text-gray-700 bg-transparent py-0.5 cursor-pointer focus:outline-none appearance-none pr-0.5"
      >
        <option value="number">Number</option>
        <option value="title">Title</option>
        <option value="time">Start Time</option>
      </select>

      <span className="w-px h-3.5 bg-gray-200 mx-0.5" aria-hidden="true" />

      <button
        type="button"
        onClick={onToggleDirection}
        title={sortDirection === 'asc' ? 'Ascending (click for descending)' : 'Descending (click for ascending)'}
        aria-label={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
        className={`p-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
          sortDirection === 'desc'
            ? 'text-blue-600 bg-blue-50 font-bold'
            : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
        }`}
      >
        {sortDirection === 'asc' ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  );
};
