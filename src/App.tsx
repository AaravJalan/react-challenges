import { useState, useEffect } from 'react';
import './App.css';

interface Course {
  term: string;
  number: string;
  meets: string;
  title: string;
}

interface Schedule {
  title: string;
  courses: Record<string, Course>;
}

const useSchedule = () => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('https://courses.cs.northwestern.edu/394/guides/data/cs-courses.php');
        if (!response.ok) throw new Error('Failed to fetch schedule');
        const data = await response.json();
        setSchedule(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return { schedule, isLoading, error };
};

const CourseCard = ({ course }: { course: Course }) => (
  <div className="modern-card">
    <h2 className="modern-card-header">
      {course.term} CS {course.number}
    </h2>
    <p className="modern-card-title">
      {course.title}
    </p>

    <div className="modern-card-footer">
      <p className="modern-card-meets">
        {course.meets}
      </p>
    </div>
  </div>
);

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
        <div className="modern-card-grid">
          {Object.entries(schedule.courses).map(([id, course]) => (
            <CourseCard key={id} course={course} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
