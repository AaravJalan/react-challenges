import { useState } from 'react';
import type { Schedule } from '../types';
import { TermSelector } from './TermSelector';
import { CourseCard } from './CourseCard';

export const TermPage = ({ schedule }: { schedule: Schedule }) => {
  const [selectedTerm, setSelectedTerm] = useState('Fall');
  
  const filteredCourses = Object.entries(schedule.courses).filter(
    ([, course]) => course.term === selectedTerm
  );

  return (
    <div>
      <TermSelector term={selectedTerm} setTerm={setSelectedTerm} />
      <div className="modern-card-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(([id, course]) => (
            <CourseCard key={id} course={course} />
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
