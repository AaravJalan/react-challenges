import { useDataQuery } from '../utilities/firebase';
import type { Schedule } from '../types';

export const useSchedule = () => {
  const [schedule, isLoading, error] = useDataQuery<Schedule>('/');

  return {
    schedule: schedule ?? null,
    isLoading,
    error: error ?? null,
  };
};
