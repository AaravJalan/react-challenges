import { useDataQuery } from '../utilities/firebase';
import type { Schedule, Course } from '../types';

export const useSchedule = () => {
  const [title, titleLoading, titleError] = useDataQuery<string>('/title');
  const [courses, coursesLoading, coursesError] = useDataQuery<Record<string, Course>>('/courses');

  const schedule: Schedule | null = title && courses ? { title, courses } : null;
  const isLoading = titleLoading || coursesLoading;
  const error = titleError || coursesError || null;

  return {
    schedule,
    isLoading,
    error,
  };
};
