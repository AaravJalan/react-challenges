interface TermSelectorProps {
  term: string;
  setTerm: (term: string) => void;
}

const terms = ['Fall', 'Winter', 'Spring'];

export const TermSelector = ({ term, setTerm }: TermSelectorProps) => (
  <div className="flex gap-3 mb-8">
    {terms.map(t => (
      <button 
        key={t}
        className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
          term === t 
            ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-600' 
            : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-sm'
        }`}
        onClick={() => setTerm(t)}
      >
        {t}
      </button>
    ))}
  </div>
);
