import type { Course } from '../types';

export const CourseCard = ({ course }: { course: Course }) => (
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
