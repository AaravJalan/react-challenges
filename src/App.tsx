import { useSchedule } from './hooks/useSchedule';
import { TermPage } from './components/TermPage';
import './App.css';

const App = () => {
  const { schedule, isLoading, error } = useSchedule();

  if (error) return <div className="p-8 text-red-500 font-medium">Error loading schedule: {error.message}</div>;
  if (isLoading || !schedule) return <div className="p-8 text-gray-500 font-medium">Loading courses...</div>;

  return (
    <div className="modern-app">
      <main className="modern-main">
        <h1 className="modern-title">
          {schedule.title}
        </h1>
        <TermPage schedule={schedule} />
      </main>
    </div>
  );
};

export default App;
