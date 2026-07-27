import { describe, it, expect, beforeEach } from 'vitest';
import { saveAuth, getAuth, clearAuth } from './useAuth';
import type { GitLabUser } from '../lib/gitlab';

const user: GitLabUser = {
  id: 1,
  username: 'u',
  name: 'U',
  email: 'e',
  state: 'active',
  avatar_url: '',
  web_url: '',
};

beforeEach(() => localStorage.clear());

describe('useAuth', () => {
  it('saveAuth then getAuth returns the stored payload', () => {
    saveAuth('tok', user);
    const got = getAuth();
    expect(got?.token).toBe('tok');
    expect(got?.user.username).toBe('u');
    expect(got?.ts).toBeGreaterThan(0);
  });

  it('getAuth returns null when nothing stored', () => {
    expect(getAuth()).toBeNull();
  });

  it('clearAuth removes the payload', () => {
    saveAuth('tok', user);
    clearAuth();
    expect(getAuth()).toBeNull();
  });

  it('getAuth returns null on corrupt JSON', () => {
    localStorage.setItem('byclaw_auth', '{not json');
    expect(getAuth()).toBeNull();
  });
});
