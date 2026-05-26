import { getSupabaseClient } from './baseService';
import { mapAuthError } from '../utils/authErrors';
import { ROLES } from '../utils/constants';
import { getProfileById } from './profileService';

const supabase = getSupabaseClient();

function normalizeProfile(row) {
  if (!row) return null;
  return {
    ...row,
    role: row.role_code ?? ROLES.CUSTOMER,
    roles: undefined,
  };
}

function wrapAuthError(error) {
  const wrapped = new Error(mapAuthError(error));
  wrapped.cause = error;
  throw wrapped;
}

export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    wrapAuthError(error);
  }
}

export async function register(fullName, email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    wrapAuthError(error);
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(mapAuthError(error));
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(mapAuthError(error));
  return data.user ?? null;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const profile = await getProfileById(user.id);
    return normalizeProfile(profile);
  } catch {
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? '',
      role: ROLES.CUSTOMER,
    };
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(mapAuthError(error));
  return data.session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
