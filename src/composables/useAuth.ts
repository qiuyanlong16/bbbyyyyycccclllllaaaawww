import type { GitLabUser } from '../lib/gitlab';

const KEY = 'byclaw_auth';

export interface AuthState {
  token: string;
  user: GitLabUser;
  ts: number;
}

export function saveAuth(token: string, user: GitLabUser): void {
  const state: AuthState = { token, user, ts: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(KEY);
}
