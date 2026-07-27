export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  email: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export type TokenError = 'invalid' | 'forbidden' | 'inactive' | 'network' | 'unknown';

export interface ValidateResult {
  ok: boolean;
  user?: GitLabUser;
  error?: TokenError;
}

export async function validateToken(
  gitlabUrl: string,
  token: string,
): Promise<ValidateResult> {
  try {
    const res = await fetch(`${gitlabUrl}/api/v4/user`, {
      headers: { 'PRIVATE-TOKEN': token },
    });
    if (res.status === 401) return { ok: false, error: 'invalid' };
    if (res.status === 403) return { ok: false, error: 'forbidden' };
    if (!res.ok) return { ok: false, error: 'unknown' };
    const user = (await res.json()) as GitLabUser;
    if (user.state !== 'active') return { ok: false, error: 'inactive' };
    return { ok: true, user };
  } catch {
    return { ok: false, error: 'network' };
  }
}
