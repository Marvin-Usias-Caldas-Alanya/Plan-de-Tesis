import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentProfile,
  getSession,
  login as authLogin,
  logout as authLogout,
  onAuthStateChange,
  register as authRegister,
} from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

async function loadAuthState() {
  const session = await getSession();
  if (!session?.user) {
    return { user: null, profile: null };
  }

  const profile = await getCurrentProfile();
  return { user: session.user, profile };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncState = useCallback(async () => {
    const state = await loadAuthState();
    setUser(state.user);
    setProfile(state.profile);
    return state;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (mounted) await syncState();
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: subscription } = onAuthStateChange(async () => {
      if (!mounted) return;
      try {
        await syncState();
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [syncState]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { user: authUser } = await authLogin(email, password);
      setUser(authUser);
      const nextProfile = await getCurrentProfile();
      setProfile(nextProfile);
      return { user: authUser, profile: nextProfile };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    setError(null);
    try {
      const data = await authRegister(fullName, email, password);
      if (data.user) {
        setUser(data.user);
        const nextProfile = await getCurrentProfile();
        setProfile(nextProfile);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    await authLogout();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const nextProfile = await getCurrentProfile();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const role = profile?.role ?? ROLES.CUSTOMER;

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      loading,
      error,
      isAuthenticated: Boolean(user),
      isAdmin: role === ROLES.ADMIN,
      isSeller: role === ROLES.SELLER,
      isCustomer: role === ROLES.CUSTOMER,
      login,
      register,
      logout,
      refreshProfile,
      clearError: () => setError(null),
    }),
    [user, profile, role, loading, error, login, register, logout, refreshProfile],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
