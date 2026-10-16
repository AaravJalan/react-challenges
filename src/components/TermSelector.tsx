interface TermSelectorProps {
  term: string;
  setTerm: (term: string) => void;
}

const terms = ['Fall', 'Winter', 'Spring'];

const activeColorMap: Record<string, string> = {
  Fall: 'bg-orange-500 text-white shadow-md ring-1 ring-orange-500',
  Winter: 'bg-blue-600 text-white shadow-md ring-1 ring-blue-600',
  Spring: 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-600',
};

export const TermSelector = ({ term, setTerm }: TermSelectorProps) => (
  <div className="flex gap-3">
    {terms.map(t => (
      <button 
        key={t}
        className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
          term === t 
            ? (activeColorMap[t] || 'bg-blue-600 text-white shadow-md ring-1 ring-blue-600')
            : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-sm'
        }`}
        onClick={() => setTerm(t)}
      >
        {t}
      </button>
    ))}
  </div>
);
