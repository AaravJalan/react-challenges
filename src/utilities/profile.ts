import { useAuthState, useDataQuery } from './firebase';
import type { User } from 'firebase/auth';

export interface Profile {
  user: User | null;
  isAdmin: boolean;
}

export const useProfile = (): [Profile, boolean, Error | undefined] => {
  const { user } = useAuthState();
  const [isAdmin, isLoading, error] = useDataQuery<boolean>(`/admins/${user?.uid || 'guest'}`);

  return [{ user, isAdmin: Boolean(isAdmin) }, isLoading, error];
};
