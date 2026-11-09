import { useState, useEffect, useMemo, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../utilities/firebase';
import { useProfile } from '../utilities/profile';

export type Term = 'Fall' | 'Winter' | 'Spring';
export type ScheduleMap = Record<Term, string[]>;

const DEFAULT_SCHEDULES: ScheduleMap = {
  Fall: [],
  Winter: [],
  Spring: [],
};

const GUEST_STORAGE_KEY = 'guest_schedules';

const loadGuestStorage = (): ScheduleMap => {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULES;
  const raw = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!raw) return DEFAULT_SCHEDULES;
  try {
    const parsed = JSON.parse(raw);
    return {
      Fall: Array.isArray(parsed.Fall) ? parsed.Fall : [],
      Winter: Array.isArray(parsed.Winter) ? parsed.Winter : [],
      Spring: Array.isArray(parsed.Spring) ? parsed.Spring : [],
    };
  } catch {
    return DEFAULT_SCHEDULES;
  }
};

export const useCalendarSchedule = (selectedTerm: string) => {
  const [{ user, isAdmin }] = useProfile();
  const [guestSchedules, setGuestSchedules] = useState<ScheduleMap>(loadGuestStorage);
  const [accountSchedules, setAccountSchedules] = useState<ScheduleMap>(DEFAULT_SCHEDULES);

  // Subscribe to real-time database updates when authenticated
  useEffect(() => {
    if (!user) return;

    const userScheduleRef = ref(database, `users/${user.uid}/schedules`);
    const unsubscribe = onValue(
      userScheduleRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            setAccountSchedules({
              Fall: Array.isArray(val.Fall) ? val.Fall : [],
              Winter: Array.isArray(val.Winter) ? val.Winter : [],
              Spring: Array.isArray(val.Spring) ? val.Spring : [],
            });
            return;
          }
        }
        setAccountSchedules(DEFAULT_SCHEDULES);
      },
      (error) => {
        console.error('Failed to sync cloud schedule:', error);
      }
    );

    return () => {
      unsubscribe();
      setAccountSchedules(DEFAULT_SCHEDULES);
    };
  }, [user]);

  // Active schedules depend on authentication status (no data leakage on sign-out)
  const activeSchedules = user ? accountSchedules : guestSchedules;

  const currentTermSelected = useMemo(() => {
    const termKey = selectedTerm as Term;
    return activeSchedules[termKey] || [];
  }, [activeSchedules, selectedTerm]);

  const toggleCourse = useCallback((courseId: string) => {
    const termKey = selectedTerm as Term;
    const currentList = activeSchedules[termKey] || [];
    const updatedList = currentList.includes(courseId)
      ? currentList.filter(id => id !== courseId)
      : [...currentList, courseId];

    const nextSchedules: ScheduleMap = {
      ...activeSchedules,
      [termKey]: updatedList,
    };

    if (user) {
      setAccountSchedules(nextSchedules);
      set(ref(database, `users/${user.uid}/schedules`), nextSchedules);
    } else {
      setGuestSchedules(nextSchedules);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextSchedules));
    }
  }, [activeSchedules, selectedTerm, user]);

  const clearTerm = useCallback(() => {
    const termKey = selectedTerm as Term;
    const nextSchedules: ScheduleMap = {
      ...activeSchedules,
      [termKey]: [],
    };

    if (user) {
      setAccountSchedules(nextSchedules);
      set(ref(database, `users/${user.uid}/schedules`), nextSchedules);
    } else {
      setGuestSchedules(nextSchedules);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(nextSchedules));
    }
  }, [activeSchedules, selectedTerm, user]);

  const totalSelectedCount = useMemo(() => {
    return Object.values(activeSchedules).reduce((sum, list) => sum + list.length, 0);
  }, [activeSchedules]);

  return {
    user,
    isAdmin,
    activeSchedules,
    currentTermSelected,
    toggleCourse,
    clearTerm,
    totalSelectedCount,
    isSavedToAccount: Boolean(user),
  };
};
