import { signInWithGoogle, signOut, useAuthState } from '../utilities/firebase';

export const Banner = () => {
  const { user, isInitialLoading } = useAuthState();

  return (
    <header className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {isInitialLoading
              ? 'Loading...'
              : user
              ? `Welcome, ${user.displayName || user.email}`
              : 'Welcome, Guest!'}
          </p>
          <p className="text-xs text-gray-500">
            {user ? 'Signed in with Google' : 'Sign in to edit course schedule'}
          </p>
        </div>
      </div>

      <div>
        {user ? (
          <button
            type="button"
            onClick={signOut}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white ring-1 ring-inset ring-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-2xs transition-all cursor-pointer"
          >
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887C18.2 16.035 15.635 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.47 0 2.805.54 3.84 1.425l2.4-2.4C16.89 3.48 14.7 2.6 12.24 2.6 7.05 2.6 2.85 6.8 2.85 12s4.2 9.4 9.39 9.4c5.43 0 9.06-3.825 9.06-9.225 0-.645-.06-1.275-.18-1.89h-8.88z" />
            </svg>
            <span>Sign In with Google</span>
          </button>
        )}
      </div>
    </header>
  );
};

